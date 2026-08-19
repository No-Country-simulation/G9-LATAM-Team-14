package com.g9latam.team14.debt.domain.service;

import com.g9latam.team14.debt.domain.model.Debt;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.Locale;

public final class DebtFinancialCalculator {
    private static final BigDecimal HOUSING_RATE = new BigDecimal("10.00");
    private static final BigDecimal EDUCATIONAL_RATE = new BigDecimal("12.00");
    private static final BigDecimal CREDIT_CARD_RATE = new BigDecimal("24.00");
    private static final BigDecimal VEHICLE_RATE = new BigDecimal("16.00");
    private static final BigDecimal PERSONAL_RATE = new BigDecimal("18.00");

    private DebtFinancialCalculator() {
    }

    public static BigDecimal annualEffectiveRateFor(String category) {
        String normalized = normalize(category);
        if (normalized.contains("vivienda") || normalized.contains("hipotec")) {
            return HOUSING_RATE;
        }
        if (normalized.contains("educativ") || normalized.contains("estudi")) {
            return EDUCATIONAL_RATE;
        }
        if (normalized.contains("tarjeta")) {
            return CREDIT_CARD_RATE;
        }
        if (normalized.contains("vehicul") || normalized.contains("carro") || normalized.contains("moto")) {
            return VEHICLE_RATE;
        }
        return PERSONAL_RATE;
    }

    public static BigDecimal monthlyPayment(BigDecimal principal, Integer months, BigDecimal annualEffectiveRate) {
        if (principal == null || principal.compareTo(BigDecimal.ZERO) <= 0 || months == null || months <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        double monthlyRate = Math.pow(1 + annualEffectiveRate.doubleValue() / 100.0, 1.0 / 12.0) - 1.0;
        if (monthlyRate == 0) {
            return principal.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
        }

        double factor = Math.pow(1 + monthlyRate, months);
        double payment = principal.doubleValue() * monthlyRate * factor / (factor - 1);
        return BigDecimal.valueOf(payment).setScale(2, RoundingMode.HALF_UP);
    }

    public static Debt ensureDefaults(Debt debt) {
        if (debt.getAnnualEffectiveRate() == null) {
            debt.setAnnualEffectiveRate(annualEffectiveRateFor(debt.getCategory()));
        }
        if (debt.getOutstandingBalance() == null) {
            BigDecimal original = debt.getTotalAmount() != null ? debt.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal monthly = debt.getMonthlyAmount() != null ? debt.getMonthlyAmount() : BigDecimal.ZERO;
            int paid = debt.getPaidInstallments() != null ? debt.getPaidInstallments() : 0;
            debt.setOutstandingBalance(original.subtract(monthly.multiply(BigDecimal.valueOf(paid)))
                    .max(BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP));
        }
        return debt;
    }

    public static int remainingMonths(BigDecimal balance, BigDecimal payment, BigDecimal annualEffectiveRate) {
        if (balance == null || balance.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        if (payment == null || payment.compareTo(BigDecimal.ZERO) <= 0) {
            return Integer.MAX_VALUE;
        }
        double monthlyRate = Math.pow(1 + annualEffectiveRate.doubleValue() / 100.0, 1.0 / 12.0) - 1.0;
        if (monthlyRate == 0) {
            return (int) Math.ceil(balance.doubleValue() / payment.doubleValue());
        }
        if (payment.doubleValue() <= balance.doubleValue() * monthlyRate) {
            return Integer.MAX_VALUE;
        }
        double months = -Math.log(1 - monthlyRate * balance.doubleValue() / payment.doubleValue())
                / Math.log(1 + monthlyRate);
        return (int) Math.ceil(months);
    }

    public static BigDecimal projectOneMonth(BigDecimal balance, BigDecimal payment, BigDecimal annualEffectiveRate) {
        if (balance == null || balance.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        double monthlyRate = Math.pow(1 + annualEffectiveRate.doubleValue() / 100.0, 1.0 / 12.0) - 1.0;
        BigDecimal withInterest = balance.multiply(BigDecimal.valueOf(1 + monthlyRate));
        return withInterest.subtract(payment != null ? payment : BigDecimal.ZERO)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String withoutAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccents
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }
}
