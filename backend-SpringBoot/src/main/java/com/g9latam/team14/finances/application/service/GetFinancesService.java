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
import java.util.List;

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
        int confirmedMovementsCount = 0;

        if (userId != null) {
            UserEntity user = userJpaRepository.findById(userId).orElse(null);
            if (user != null && user.getIngresoMensual() != null) {
                totalIncome = user.getIngresoMensual().doubleValue();
            }

            List<MovementEntity> movements = movementJpaRepository.findByUserIdOrderByDateDesc(userId);
            confirmedMovementsCount = movements.size();
            for (MovementEntity m : movements) {
                if (m.getAmount() != null) {
                    if ("INGRESO".equalsIgnoreCase(m.getType())) {
                        totalIncome += m.getAmount().doubleValue();
                    } else if ("GASTO".equalsIgnoreCase(m.getType()) || "EGRESO".equalsIgnoreCase(m.getType())) {
                        totalExpenses += m.getAmount().doubleValue();
                    }
                }
            }

            List<DebtEntity> debts = debtRepository.findByUserId(userId);
            for (DebtEntity d : debts) {
                if (d.getStatus() != null && "ACTIVE".equalsIgnoreCase(d.getStatus().name()) && d.getMonthlyAmount() != null) {
                    debtPayments += d.getMonthlyAmount().doubleValue();
                }
            }
        }

        return dsRecommendationPort.fetchRecommendationAndStatus(userId, totalIncome, totalExpenses, debtPayments, periodDays, confirmedMovementsCount);
    }
}
