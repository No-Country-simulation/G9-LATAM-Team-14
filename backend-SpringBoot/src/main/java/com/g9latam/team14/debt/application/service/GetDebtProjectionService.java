package com.g9latam.team14.debt.application.service;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtProjectionPoint;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.ports.inbound.GetDebtProjectionUseCase;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import com.g9latam.team14.debt.domain.service.DebtFinancialCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GetDebtProjectionService implements GetDebtProjectionUseCase {
    private final DebtRepositoryPort debtRepository;

    @Override
    @Cacheable(value = "debtProjection", key = "#userId")
    public List<DebtProjectionPoint> getDebtProjectionByUserId(Integer userId) {
        List<Debt> activeDebts = debtRepository.findByUserIdAndStatus(userId, DebtStatus.ACTIVE);
        List<DebtProjectionPoint> points = new ArrayList<>();
        LocalDate current = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        activeDebts.forEach(DebtFinancialCalculator::ensureDefaults);
        List<BigDecimal> projectedBalances = activeDebts.stream()
                .map(Debt::getOutstandingBalance)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));

        for (int i = 0; i <= 12; i++) {
            LocalDate targetMonth = current.plusMonths(i);
            BigDecimal currentTotalBalance = BigDecimal.ZERO;
            for (BigDecimal balance : projectedBalances) {
                currentTotalBalance = currentTotalBalance.add(balance);
            }
            points.add(DebtProjectionPoint.builder()
                    .month(targetMonth.format(formatter))
                    .balance(currentTotalBalance)
                    .build());
            for (int debtIndex = 0; debtIndex < activeDebts.size(); debtIndex++) {
                Debt debt = activeDebts.get(debtIndex);
                projectedBalances.set(debtIndex, DebtFinancialCalculator.projectOneMonth(
                        projectedBalances.get(debtIndex),
                        debt.getMonthlyAmount(),
                        debt.getAnnualEffectiveRate()
                ));
            }
        }
        return points;
    }
}
