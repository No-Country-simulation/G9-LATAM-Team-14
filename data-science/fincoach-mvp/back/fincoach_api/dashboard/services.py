from collections import defaultdict
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone

from transactions.models import Transaction


ZERO = Decimal('0.00')
TWO_PLACES = Decimal('0.01')


def parse_month(value=None):
    if value is None or value == '':
        return timezone.localdate().replace(day=1)

    parts = str(value).split('-')
    if len(parts) != 2:
        raise ValueError('Use the YYYY-MM format.')
    try:
        year = int(parts[0])
        month = int(parts[1])
        selected_month = date(year, month, 1)
    except (TypeError, ValueError) as error:
        raise ValueError('Use a valid month in YYYY-MM format.') from error
    if str(value) != '{:04d}-{:02d}'.format(year, month):
        raise ValueError('Use the YYYY-MM format.')
    return selected_month


def shift_month(month, offset):
    month_index = month.year * 12 + month.month - 1 + offset
    year, zero_based_month = divmod(month_index, 12)
    return date(year, zero_based_month + 1, 1)


def month_bounds(month):
    return month, shift_month(month, 1)


def money(value):
    return Decimal(value or 0).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def number(value):
    return float(money(value))


def confirmed_transactions(user, month=None):
    transactions = Transaction.objects.filter(
        user=user,
        status='confirmed',
    ).select_related('debt_payment')
    if month is not None:
        start, end = month_bounds(month)
        transactions = transactions.filter(
            transaction_date__gte=start,
            transaction_date__lt=end,
        )
    return transactions


def transaction_categories(transaction):
    categories = transaction.current_categories or []
    if categories:
        return categories
    if transaction.model_category:
        return [{
            'category': transaction.model_category,
            'percentage': 100.0,
        }]
    return []


def transaction_regularity(transaction):
    return transaction.current_regularity or transaction.model_regularity


def summarize_amounts(transactions):
    income = ZERO
    fixed_expenses = ZERO
    variable_expenses = ZERO

    for transaction in transactions:
        amount = money(transaction.amount)
        if transaction.direction == 'entrada':
            income += amount
        elif transaction_regularity(transaction) == 'fijo':
            fixed_expenses += amount
        else:
            variable_expenses += amount

    expenses = fixed_expenses + variable_expenses
    return {
        'income': income,
        'fixed_expenses': fixed_expenses,
        'variable_expenses': variable_expenses,
        'expenses': expenses,
        'balance': income - expenses,
    }


def calculate_change(current, previous):
    if previous == 0:
        return 0.0 if current == 0 else None
    return round(float((current - previous) / previous * 100), 2)


def category_distribution(transactions, limit=None):
    totals = defaultdict(lambda: ZERO)
    total_expenses = ZERO

    for transaction in transactions:
        if transaction.direction != 'salida':
            continue
        amount = money(transaction.amount)
        total_expenses += amount
        for item in transaction_categories(transaction):
            percentage = Decimal(str(item.get('percentage', 0)))
            totals[str(item.get('category', ''))] += amount * percentage / 100

    ordered = sorted(
        totals.items(),
        key=lambda item: (-item[1], item[0]),
    )
    if limit is not None:
        ordered = ordered[:limit]

    return [
        {
            'category': category,
            'amount': number(amount),
            'percentage': (
                round(float(amount / total_expenses * 100), 2)
                if total_expenses
                else 0.0
            ),
        }
        for category, amount in ordered
        if category
    ]


def debt_payments(transactions):
    total = ZERO
    for transaction in transactions:
        if transaction.direction != 'salida':
            continue
        amount = money(transaction.amount)
        for item in transaction_categories(transaction):
            if item.get('category') == 'Deuda y financiación':
                total += amount * Decimal(str(item.get('percentage', 0))) / 100
    return money(total)


def composition(transactions, direction):
    fixed = ZERO
    variable = ZERO
    for transaction in transactions:
        if transaction.direction != direction:
            continue
        if transaction_regularity(transaction) == 'fijo':
            fixed += money(transaction.amount)
        else:
            variable += money(transaction.amount)

    total = fixed + variable
    return [
        {
            'type': 'fixed',
            'amount': number(fixed),
            'percentage': round(float(fixed / total * 100), 2) if total else 0.0,
        },
        {
            'type': 'variable',
            'amount': number(variable),
            'percentage': round(float(variable / total * 100), 2) if total else 0.0,
        },
    ]


def average_confidence(transactions):
    values = [
        Decimal(transaction.model_category_confidence_percentage)
        for transaction in transactions
        if transaction.model_category_confidence_percentage is not None
    ]
    if not values:
        return None
    return round(float(sum(values, ZERO) / len(values)), 2)


def debt_level(percentage):
    if percentage is None:
        return 'not_available'
    value = float(percentage)
    if value < 20:
        return 'healthy'
    if value < 35:
        return 'manageable'
    if value < 50:
        return 'risky'
    return 'critical'


def build_alerts(current, previous, categories, profile):
    alerts = []
    expense_change = calculate_change(current['expenses'], previous['expenses'])

    if current['income'] == 0 and current['expenses'] == 0:
        alerts.append({
            'type': 'no_confirmed_transactions',
            'severity': 'information',
            'message': 'There are no confirmed transactions for the selected month.',
        })
        return alerts

    if current['balance'] < 0:
        alerts.append({
            'type': 'negative_balance',
            'severity': 'critical',
            'message': 'Confirmed expenses are greater than confirmed income.',
        })
    if expense_change is not None and expense_change >= 10:
        alerts.append({
            'type': 'expense_increase',
            'severity': 'warning',
            'value_percentage': expense_change,
            'message': 'Expenses increased compared with the previous month.',
        })
    elif expense_change is not None and expense_change <= -10:
        alerts.append({
            'type': 'expense_decrease',
            'severity': 'positive',
            'value_percentage': expense_change,
            'message': 'Expenses decreased compared with the previous month.',
        })
    if categories:
        alerts.append({
            'type': 'highest_expense_category',
            'severity': 'information',
            'category': categories[0]['category'],
            'amount': categories[0]['amount'],
            'message': 'This was the category with the highest expense.',
        })
    if profile and debt_level(profile.debt_ratio_percentage) in {'risky', 'critical'}:
        alerts.append({
            'type': 'declared_debt_level',
            'severity': 'critical',
            'level': debt_level(profile.debt_ratio_percentage),
            'message': 'The declared debt level requires attention.',
        })
    return alerts


def monthly_evolution(user, selected_month, months=6):
    first_month = shift_month(selected_month, -(months - 1))
    _, end = month_bounds(selected_month)
    transactions = list(
        confirmed_transactions(user).filter(
            transaction_date__gte=first_month,
            transaction_date__lt=end,
        )
    )
    grouped = defaultdict(list)
    for transaction in transactions:
        key = transaction.transaction_date.replace(day=1)
        grouped[key].append(transaction)

    result = []
    for offset in range(months):
        month = shift_month(first_month, offset)
        month_transactions = grouped[month]
        totals = summarize_amounts(month_transactions)
        payments = debt_payments(month_transactions)
        result.append({
            'month': month.strftime('%Y-%m'),
            'income': number(totals['income']),
            'ordinary_expenses': number(totals['expenses'] - payments),
            'debt_payments': number(payments),
            'balance': number(totals['balance']),
        })
    return result


def build_dashboard(user, profile, selected_month):
    current_transactions = list(confirmed_transactions(user, selected_month))
    previous_transactions = list(
        confirmed_transactions(user, shift_month(selected_month, -1))
    )
    current = summarize_amounts(current_transactions)
    previous = summarize_amounts(previous_transactions)
    categories = category_distribution(current_transactions)
    payments = debt_payments(current_transactions)
    declared_income = money(profile.monthly_net_income) if profile else ZERO

    return {
        'month': selected_month.strftime('%Y-%m'),
        'overview': {
            'income': number(current['income']),
            'fixed_expenses': number(current['fixed_expenses']),
            'variable_expenses': number(current['variable_expenses']),
            'available': number(current['balance']),
            'expense_change_percentage': calculate_change(
                current['expenses'],
                previous['expenses'],
            ),
            'average_classification_confidence_percentage': average_confidence(
                current_transactions
            ),
        },
        'evolution': monthly_evolution(user, selected_month),
        'income_composition': composition(current_transactions, 'entrada'),
        'expense_categories': categories,
        'financial_context': {
            'declared_monthly_income': number(declared_income),
            'debt_payments': number(payments),
            'declared_debt_ratio_percentage': (
                float(profile.debt_ratio_percentage)
                if profile and profile.debt_ratio_percentage is not None
                else None
            ),
            'debt_level': (
                debt_level(profile.debt_ratio_percentage)
                if profile
                else 'not_available'
            ),
            'saving_habit': profile.saving_habit if profile else 'not_available',
            'saving_capacity': number(declared_income - current['expenses']),
        },
        'alerts': build_alerts(current, previous, categories, profile),
    }


def serialize_transaction(transaction):
    debt_payment = getattr(transaction, 'debt_payment', None)
    return {
        'id': transaction.id,
        'date': transaction.transaction_date,
        'description': transaction.description,
        'note': transaction.note,
        'amount': number(transaction.amount),
        'currency': transaction.currency,
        'direction': transaction.direction,
        'categories': transaction_categories(transaction),
        'purpose': transaction.current_purpose,
        'regularity': transaction_regularity(transaction),
        'confidence_percentage': (
            float(transaction.model_category_confidence_percentage)
            if transaction.model_category_confidence_percentage is not None
            else None
        ),
        'debt_id': debt_payment.debt_id if debt_payment else None,
    }


def build_monthly_summary(transactions):
    totals = summarize_amounts(transactions)
    return {
        'income': number(totals['income']),
        'expenses': number(totals['expenses']),
        'balance': number(totals['balance']),
        'top_expense_categories': category_distribution(transactions, limit=4),
    }
