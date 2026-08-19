package com.g9latam.team14.debt.application.service;

import com.g9latam.team14.debt.domain.model.Debt;
import com.g9latam.team14.debt.domain.model.DebtStatus;
import com.g9latam.team14.debt.domain.model.DebtType;
import com.g9latam.team14.debt.domain.ports.outbound.DebtRepositoryPort;
import com.g9latam.team14.debt.domain.service.DebtFinancialCalculator;
import com.g9latam.team14.shared.infrastructure.exception.CustomException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ApplyDebtPaymentServiceTest {

    @Test
    void appliesCardPaymentOnlyToMatchingDebt() {
        DebtRepositoryPort repository = mock(DebtRepositoryPort.class);
        Debt card = activeDebt(6, "Tarjeta de crédito", "600000.00");
        Debt educational = activeDebt(7, "Crédito educativo", "800000.00");
        when(repository.findByUserIdAndStatus(2, DebtStatus.ACTIVE))
                .thenReturn(List.of(card, educational));
        when(repository.save(any(Debt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApplyDebtPaymentService service = new ApplyDebtPaymentService(repository);
        Debt result = service.applyPayment(
                2,
                new BigDecimal("100000.00"),
                "Pago Tarjeta crédito",
                null
        );

        assertEquals(6, result.getId());
        assertEquals(new BigDecimal("500000.00"), result.getOutstandingBalance());
        assertEquals(new BigDecimal("800000.00"), educational.getOutstandingBalance());
    }

    @Test
    void rejectsEducationalDescriptionWhenOnlyCardDebtExists() {
        DebtRepositoryPort repository = mock(DebtRepositoryPort.class);
        Debt card = activeDebt(6, "Tarjeta de crédito", "600000.00");
        when(repository.findByUserIdAndStatus(2, DebtStatus.ACTIVE)).thenReturn(List.of(card));

        ApplyDebtPaymentService service = new ApplyDebtPaymentService(repository);

        assertThrows(CustomException.class, () -> service.applyPayment(
                2,
                new BigDecimal("100000.00"),
                "Pago crédito educativo",
                null
        ));
        verify(repository, never()).save(any(Debt.class));
    }

    @Test
    void usesTheReferenceRatesFromThePythonDemo() {
        assertEquals(new BigDecimal("10.00"), DebtFinancialCalculator.annualEffectiveRateFor("Crédito de vivienda"));
        assertEquals(new BigDecimal("12.00"), DebtFinancialCalculator.annualEffectiveRateFor("Crédito educativo"));
        assertEquals(new BigDecimal("24.00"), DebtFinancialCalculator.annualEffectiveRateFor("Tarjeta de crédito"));
        assertEquals(new BigDecimal("16.00"), DebtFinancialCalculator.annualEffectiveRateFor("Crédito vehicular"));
        assertEquals(new BigDecimal("18.00"), DebtFinancialCalculator.annualEffectiveRateFor("Crédito personal"));
    }

    private Debt activeDebt(Integer id, String category, String amount) {
        BigDecimal principal = new BigDecimal(amount);
        return Debt.builder()
                .id(id)
                .type(DebtType.INSTALLMENT)
                .category(category)
                .totalAmount(principal)
                .outstandingBalance(principal)
                .annualEffectiveRate(DebtFinancialCalculator.annualEffectiveRateFor(category))
                .monthlyAmount(new BigDecimal("100000.00"))
                .monthsTerm(12)
                .paidInstallments(0)
                .status(DebtStatus.ACTIVE)
                .userId(2)
                .build();
    }
}
