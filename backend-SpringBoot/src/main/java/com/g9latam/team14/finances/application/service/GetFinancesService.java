package com.g9latam.team14.finances.application.service;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity.DebtEntity;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.repository.SpringDataDebtRepository;
import com.g9latam.team14.finances.domain.model.FinancesData;
import com.g9latam.team14.finances.domain.ports.inbound.GetFinancesUseCase;
import com.g9latam.team14.finances.domain.ports.outbound.DsRecommendationServicePort;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.entity.MovementEntity;
import com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GetFinancesService implements GetFinancesUseCase {
    private final DsRecommendationServicePort dsRecommendationPort;
    private final MovementJpaRepository movementJpaRepository;
    private final SpringDataDebtRepository debtRepository;
    private final UserJpaRepository userJpaRepository;

    @Override
    public FinancesData getFinances(Integer userId, Integer periodDays) {
        double totalIncome = 0.0;
        double totalExpenses = 0.0;
        double debtPayments = 0.0;
        double debtBalance = 0.0;
        int confirmedMovementsCount = 0;
        boolean hasFixedIncome = false;
        boolean hasVariableIncome = false;
        Map<YearMonth, Double> incomeByMonth = new HashMap<>();
        YearMonth firstMonth = null;
        YearMonth lastMonth = null;

        if (userId != null) {
            UserEntity user = userJpaRepository.findById(userId).orElse(null);
            List<MovementEntity> movements = movementJpaRepository.findByUserIdOrderByDateDesc(userId);
            confirmedMovementsCount = movements.size();
            for (MovementEntity m : movements) {
                YearMonth movementMonth = parseMonth(m.getDate());
                if (movementMonth != null) {
                    if (firstMonth == null || movementMonth.isBefore(firstMonth)) firstMonth = movementMonth;
                    if (lastMonth == null || movementMonth.isAfter(lastMonth)) lastMonth = movementMonth;
                    incomeByMonth.putIfAbsent(movementMonth, 0.0);
                }
                if (m.getAmount() != null) {
                    if ("INGRESO".equalsIgnoreCase(m.getType())) {
                        totalIncome += m.getAmount().doubleValue();
                        if (movementMonth != null) {
                            incomeByMonth.merge(movementMonth, m.getAmount().doubleValue(), Double::sum);
                        }
                        if ("variable".equalsIgnoreCase(m.getRegularity())) hasVariableIncome = true;
                        else hasFixedIncome = true;
                    } else if ("GASTO".equalsIgnoreCase(m.getType()) || "EGRESO".equalsIgnoreCase(m.getType())) {
                        totalExpenses += m.getAmount().doubleValue();
                    }
                }
            }

            if (totalIncome == 0.0 && user != null && user.getIngresoMensual() != null) {
                totalIncome = user.getIngresoMensual().doubleValue();
                hasFixedIncome = totalIncome > 0;
            }

            List<DebtEntity> debts = debtRepository.findByUserId(userId);
            for (DebtEntity d : debts) {
                if (d.getStatus() != null && "ACTIVE".equalsIgnoreCase(d.getStatus().name()) && d.getMonthlyAmount() != null) {
                    debtPayments += d.getMonthlyAmount().doubleValue();
                    if (d.getTotalAmount() != null) {
                        debtBalance += d.getTotalAmount().doubleValue();
                    }
                }
            }
        }

        int observedPeriods = countObservedPeriods(firstMonth, lastMonth);
        int periodsWithoutIncome = countPeriodsWithoutIncome(firstMonth, lastMonth, incomeByMonth);
        double incomeVariability = calculateIncomeVariability(firstMonth, lastMonth, incomeByMonth);
        String incomeStatus = resolveIncomeStatus(hasFixedIncome, hasVariableIncome, totalIncome);

        return dsRecommendationPort.fetchRecommendationAndStatus(
                userId,
                totalIncome,
                totalExpenses,
                debtPayments,
                debtBalance,
                incomeStatus,
                incomeVariability,
                periodsWithoutIncome,
                observedPeriods,
                periodDays,
                confirmedMovementsCount
        );
    }

    private YearMonth parseMonth(String date) {
        if (date == null || date.length() < 10) return null;
        try {
            return YearMonth.from(LocalDate.parse(date.substring(0, 10)));
        } catch (Exception ignored) {
            return null;
        }
    }

    private int countObservedPeriods(YearMonth first, YearMonth last) {
        if (first == null || last == null) return 1;
        int count = 0;
        for (YearMonth month = first; !month.isAfter(last); month = month.plusMonths(1)) count++;
        return Math.max(count, 1);
    }

    private int countPeriodsWithoutIncome(YearMonth first, YearMonth last, Map<YearMonth, Double> incomes) {
        if (first == null || last == null) return 0;
        int count = 0;
        for (YearMonth month = first; !month.isAfter(last); month = month.plusMonths(1)) {
            if (incomes.getOrDefault(month, 0.0) <= 0.0) count++;
        }
        return count;
    }

    private double calculateIncomeVariability(YearMonth first, YearMonth last, Map<YearMonth, Double> incomes) {
        int periods = countObservedPeriods(first, last);
        if (first == null || last == null || periods <= 1) return 0.0;
        double total = 0.0;
        for (YearMonth month = first; !month.isAfter(last); month = month.plusMonths(1)) {
            total += incomes.getOrDefault(month, 0.0);
        }
        double mean = total / periods;
        if (mean <= 0.0) return 0.0;
        double squaredDifferences = 0.0;
        for (YearMonth month = first; !month.isAfter(last); month = month.plusMonths(1)) {
            double difference = incomes.getOrDefault(month, 0.0) - mean;
            squaredDifferences += difference * difference;
        }
        return Math.sqrt(squaredDifferences / periods) / mean;
    }

    private String resolveIncomeStatus(boolean hasFixed, boolean hasVariable, double totalIncome) {
        if (totalIncome <= 0.0) return "sin_ingresos";
        if (hasFixed && hasVariable) return "mixto";
        if (hasVariable) return "variable";
        return "fijo";
    }
}
