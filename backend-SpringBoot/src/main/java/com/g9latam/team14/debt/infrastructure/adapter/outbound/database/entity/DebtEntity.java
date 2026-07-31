package com.g9latam.team14.debt.infrastructure.adapter.outbound.database.entity;
import com.g9latam.team14.debt.domain.model.DebtPaymentMode;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.model.DebtType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "debts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DebtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private DebtType type;

    @Column(name = "category")
    private String category;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "monthly_amount")
    private BigDecimal monthlyAmount;

    @Column(name = "months_term")
    private Integer monthsTerm;

    @Column(name = "paid_installments")
    private Integer paidInstallments;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode")
    private DebtPaymentMode paymentMode;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_indefinite")
    private Boolean isIndefinite;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private DebtStatus status;

    @Column(name = "user_id")
    private Integer userId;
}
