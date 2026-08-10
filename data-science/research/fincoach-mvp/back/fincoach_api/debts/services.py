from collections import defaultdict
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
import math

from django.utils import timezone

from .models import Debt, DebtPayment


ZERO = Decimal('0.00')
TWO_PLACES = Decimal('0.01')


def money(value):
    return Decimal(value or 0).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def number(value):
    return float(money(value))


def add_months(value, amount):
    month_index = value.year * 12 + value.month - 1 + amount
    year, zero_based_month = divmod(month_index, 12)
    month = zero_based_month + 1
    days = [
        31,
        29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ]
    return date(year, month, min(value.day, days[month - 1]))


def calculate_monthly_payment(amount, term_months, annual_effective_rate):
    principal = float(amount)
    monthly_rate = (1 + float(annual_effective_rate) / 100) ** (1 / 12) - 1
    if monthly_rate == 0:
        payment = principal / term_months
    else:
        factor = (1 + monthly_rate) ** term_months
        payment = principal * monthly_rate * factor / (factor - 1)
    return money(str(payment))


def calculate_remaining_months(balance, payment, annual_effective_rate):
    balance = float(balance)
    payment = float(payment)
    if balance <= 0:
        return 0
    monthly_rate = (1 + float(annual_effective_rate) / 100) ** (1 / 12) - 1
    if monthly_rate == 0:
        return math.ceil(balance / payment)
    if payment <= balance * monthly_rate:
        return None
    months = -math.log(1 - monthly_rate * balance / payment) / math.log(
        1 + monthly_rate
    )
    return math.ceil(months)


def prepare_debt(debt):
    debt.original_amount = money(debt.original_amount)
    debt.annual_effective_rate = Debt.ANNUAL_EFFECTIVE_RATES[debt.debt_type]
    debt.monthly_payment = calculate_monthly_payment(
        debt.original_amount,
        debt.term_months,
        debt.annual_effective_rate,
    )
    return debt


def debt_payment_totals(debts):
    totals = defaultdict(lambda: ZERO)
    payments = DebtPayment.objects.filter(
        debt__in=debts,
        transaction__status='confirmed',
        transaction__direction='salida',
    ).select_related('transaction')
    for payment in payments:
        totals[payment.debt_id] += money(payment.allocated_amount)
    return totals, list(payments)


def debt_detail(debt, paid_amount, today):
    balance = max(money(debt.original_amount) - money(paid_amount), ZERO)
    progress = (
        round(float(money(paid_amount) / debt.original_amount * 100), 2)
        if debt.original_amount
        else 0.0
    )
    remaining_months = calculate_remaining_months(
        balance,
        debt.monthly_payment,
        debt.annual_effective_rate,
    )
    projected_end_date = (
        add_months(max(today, debt.start_date), remaining_months)
        if remaining_months is not None
        else None
    )
    estimated_interest = max(
        money(debt.monthly_payment * debt.term_months - debt.original_amount),
        ZERO,
    )
    return {
        'id': debt.id,
        'type': debt.debt_type,
        'type_label': debt.get_debt_type_display(),
        'original_amount': number(debt.original_amount),
        'outstanding_balance': number(balance),
        'confirmed_payments': number(paid_amount),
        'monthly_payment': number(debt.monthly_payment),
        'annual_effective_rate_percentage': float(debt.annual_effective_rate),
        'estimated_total_interest': number(estimated_interest),
        'term_months': debt.term_months,
        'remaining_months': remaining_months,
        'start_date': debt.start_date,
        'projected_end_date': projected_end_date,
        'progress_percentage': min(progress, 100.0),
        'status': 'paid' if balance == 0 else 'active',
    }


def build_evolution(debts, payments, today, maximum_months=24):
    if not debts:
        return []

    current_month = today.replace(day=1)
    earliest_month = min(debt.start_date for debt in debts).replace(day=1)
    first_month = max(
        earliest_month,
        add_months(current_month, -(maximum_months - 1)),
    )
    balances = {debt.id: ZERO for debt in debts}

    for debt in debts:
        if debt.start_date < first_month:
            balances[debt.id] = money(debt.original_amount)
    for payment in payments:
        if payment.transaction.transaction_date < first_month:
            balances[payment.debt_id] = max(
                balances[payment.debt_id] - money(payment.allocated_amount),
                ZERO,
            )

    payments_by_month = defaultdict(list)
    for payment in payments:
        month = payment.transaction.transaction_date.replace(day=1)
        if month >= first_month:
            payments_by_month[month].append(payment)

    result = []
    month = first_month
    while month <= current_month:
        next_month = add_months(month, 1)
        for debt in debts:
            if month <= debt.start_date < next_month:
                balances[debt.id] += money(debt.original_amount)
        for payment in payments_by_month[month]:
            balances[payment.debt_id] = max(
                balances[payment.debt_id] - money(payment.allocated_amount),
                ZERO,
            )
        result.append({
            'month': month.strftime('%Y-%m'),
            'outstanding_balance': number(sum(balances.values(), ZERO)),
        })
        month = next_month
    return result


def summarize_debts(user):
    debts = list(Debt.objects.filter(user=user))
    today = timezone.localdate()
    payment_totals, payments = debt_payment_totals(debts)
    details = [
        debt_detail(debt, payment_totals[debt.id], today)
        for debt in debts
    ]
    active = [item for item in details if item['status'] == 'active']
    end_dates = [
        item['projected_end_date']
        for item in active
        if item['projected_end_date'] is not None
    ]
    return {
        'summary': {
            'total_outstanding_balance': number(sum(
                (Decimal(str(item['outstanding_balance'])) for item in active),
                ZERO,
            )),
            'total_monthly_payment': number(sum(
                (Decimal(str(item['monthly_payment'])) for item in active),
                ZERO,
            )),
            'projected_end_date': max(end_dates, default=None),
            'active_debts': len(active),
        },
        'debts': details,
        'evolution': build_evolution(debts, payments, today),
    }
