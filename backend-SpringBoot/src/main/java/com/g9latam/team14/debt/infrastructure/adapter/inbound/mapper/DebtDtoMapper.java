package com.g9latam.team14.debt.infrastructure.adapter.inbound.mapper;
import com.g9latam.team14.debt.domain.model.*;
import com.g9latam.team14.debt.infrastructure.adapter.inbound.dtos.*;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DebtDtoMapper {
    public Debt toDomain(CreateDebtRequest request) {
        if (request == null) return null;
        LocalDate start = request.startDate() != null ? parseDate(request.startDate()) : LocalDate.now();
        LocalDate end = request.endDate() != null ? parseDate(request.endDate()) : null;
        return Debt.builder()
                .type(request.type())
                .category(request.category())
                .totalAmount(request.totalAmount())
                .monthlyAmount(request.monthlyAmount())
                .monthsTerm(request.monthsTerm())
                .paidInstallments(0)
                .paymentMode(request.paymentMode())
                .startDate(start)
                .endDate(end)
                .isIndefinite(request.isIndefinite() != null ? request.isIndefinite() : false)
                .status(DebtStatus.ACTIVE)
                .userId(request.userId())
                .build();
    }

    public Debt toDomain(UpdateDebtRequest request) {
        if (request == null) return null;
        LocalDate start = request.startDate() != null ? parseDate(request.startDate()) : null;
        LocalDate end = request.endDate() != null ? parseDate(request.endDate()) : null;
        return Debt.builder()
                .type(request.type())
                .category(request.category())
                .totalAmount(request.totalAmount())
                .monthlyAmount(request.monthlyAmount())
                .monthsTerm(request.monthsTerm())
                .paidInstallments(request.paidInstallments())
                .paymentMode(request.paymentMode())
                .startDate(start)
                .endDate(end)
                .isIndefinite(request.isIndefinite())
                .status(request.status())
                .build();
    }

    public List<Debt> toDomainBatchList(CreateBatchDebtsRequest request) {
        if (request == null || request.debts() == null) return List.of();
        return request.debts().stream()
                .map(item -> Debt.builder()
                        .type(DebtType.INSTALLMENT)
                        .category(item.category() != null ? item.category() : "General")
                        .monthlyAmount(item.amount() != null ? BigDecimal.valueOf(item.amount()) : BigDecimal.ZERO)
                        .monthsTerm(12)
                        .paidInstallments(0)
                        .startDate(LocalDate.now())
                        .status(DebtStatus.ACTIVE)
                        .userId(request.userId())
                        .build())
                .toList();
    }

    public DebtResponse toResponse(Debt debt) {
        if (debt == null) return null;
        return new DebtResponse(
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

    public List<DebtResponse> toResponseList(List<Debt> debts) {
        return debts.stream()
                .map(this::toResponse)
                .toList();
    }

    public DebtSummaryResponse toResponse(DebtSummary summary) {
        if (summary == null) return null;
        return new DebtSummaryResponse(
                summary.getTotalPendingAmount(),
                summary.getTotalMonthlyPayment(),
                summary.getIncomePercentage(),
                summary.getEstimatedFreeDate(),
                summary.getMonthsRemaining()
        );
    }

    public DebtProjectionResponse toResponse(List<DebtProjectionPoint> points) {
        List<DebtProjectionResponse.ProjectionPointDto> dtos = points.stream()
                .map(p -> new DebtProjectionResponse.ProjectionPointDto(p.getMonth(), p.getBalance()))
                .toList();
        return new DebtProjectionResponse(dtos);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            if (dateStr.length() == 7) { // format YYYY-MM
                return LocalDate.parse(dateStr + "-01");
            }
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }
}
