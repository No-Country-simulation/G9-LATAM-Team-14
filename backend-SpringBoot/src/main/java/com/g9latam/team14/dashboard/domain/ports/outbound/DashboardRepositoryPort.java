package com.g9latam.team14.dashboard.domain.ports.outbound;
import java.math.BigDecimal;
import java.time.LocalDate;

public interface DashboardRepositoryPort {
    BigDecimal sumIngresosByUserIdAndDates(Integer userId, LocalDate start, LocalDate end);
    BigDecimal sumGastosFijosByUserId(Integer userId);
    BigDecimal sumGastosVariablesByUserIdAndDates(Integer userId, LocalDate start, LocalDate end);
}
