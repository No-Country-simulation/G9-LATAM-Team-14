package com.g9latam.team14.debt.infrastructure.adapter.outbound.database.mapper;
import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity.DebtEntity;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DebtEntityMapper {
    public Debt toDomain(DebtEntity entity) {
        if (entity == null) return null;
        return Debt.builder()
                .id(entity.getId())
                .type(entity.getType())
                .category(entity.getCategory())
                .totalAmount(entity.getTotalAmount())
                .monthlyAmount(entity.getMonthlyAmount())
                .monthsTerm(entity.getMonthsTerm())
                .paidInstallments(entity.getPaidInstallments())
                .paymentMode(entity.getPaymentMode())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .isIndefinite(entity.getIsIndefinite())
                .status(entity.getStatus())
                .userId(entity.getUserId())
                .build();
    }
    public DebtEntity toEntity(Debt debt) {
        if (debt == null) return null;
        return new DebtEntity(
                debt.getId(),
                debt.getType(),
                debt.getCategory(),
                debt.getTotalAmount(),
                debt.getMonthlyAmount(),
                debt.getMonthsTerm(),
                debt.getPaidInstallments(),
                debt.getPaymentMode(),
                debt.getStartDate(),
                debt.getEndDate(),
                debt.getIsIndefinite(),
                debt.getStatus(),
                debt.getUserId()
        );
    }
    public List<Debt> toDomainList(List<DebtEntity> entities) {
        return entities.stream()
                .map(this::toDomain)
                .toList();
    }
    public List<DebtEntity> toEntityList(List<Debt> debts) {
        return debts.stream()
                .map(this::toEntity)
                .toList();
    }
}
