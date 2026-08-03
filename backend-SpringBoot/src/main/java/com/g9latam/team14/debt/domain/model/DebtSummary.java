package com.g9latam.team14.debt.domain.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebtSummary {
    private BigDecimal totalPendingAmount;
    private BigDecimal totalMonthlyPayment;
    private Double incomePercentage;
    private String estimatedFreeDate;
    private Integer monthsRemaining;
}
