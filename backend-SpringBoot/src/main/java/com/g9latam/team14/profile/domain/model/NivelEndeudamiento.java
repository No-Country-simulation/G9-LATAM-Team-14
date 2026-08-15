package com.g9latam.team14.profile.domain.model;
import java.math.BigDecimal;
public record NivelEndeudamiento(
    BigDecimal totalCuotasMensuales,
    Double porcentajeSobreIngreso,
    String nivel
) {}
