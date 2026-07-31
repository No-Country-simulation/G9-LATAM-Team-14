package com.g9latam.team14.debt.domain.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Debt {
    private Integer id;
    private DebtType type;
    private String category;
    private BigDecimal totalAmount;
    private BigDecimal monthlyAmount;
    private Integer monthsTerm;
    private Integer paidInstallments;
    private DebtPaymentMode paymentMode;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isIndefinite;
    private DebtStatus status;
    private Integer userId;
}
