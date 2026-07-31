package com.g9latam.team14.dashboard.application.service;
import com.g9latam.team14.dashboard.domain.model.DashboardSummary;
import com.g9latam.team14.dashboard.domain.ports.inbound.GetDashboardSummaryUseCase;
import com.g9latam.team14.dashboard.domain.ports.outbound.DashboardRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardSummaryService implements GetDashboardSummaryUseCase {
    private final DashboardRepositoryPort dashboardRepositoryPort;

    @Override
    @Cacheable(value = "dashboardSummary", key = "#userId")
    public DashboardSummary getSummary(Integer userId) {
        YearMonth mesActual = YearMonth.now();
        LocalDate inicioMes = mesActual.atDay(1);
        LocalDate finMes = mesActual.atEndOfMonth();
        BigDecimal totalIngresos = dashboardRepositoryPort.sumIngresosByUserIdAndDates(
                userId, inicioMes, finMes
        );
        BigDecimal totalGastosFijos = dashboardRepositoryPort.sumGastosFijosByUserId(userId);
        BigDecimal totalGastosVariables = dashboardRepositoryPort.sumGastosVariablesByUserIdAndDates(
                userId, inicioMes, finMes
        );
        totalIngresos = totalIngresos != null ? totalIngresos : BigDecimal.ZERO;
        totalGastosFijos = totalGastosFijos != null ? totalGastosFijos : BigDecimal.ZERO;
        totalGastosVariables = totalGastosVariables != null ? totalGastosVariables : BigDecimal.ZERO;
        BigDecimal balanceNeto = totalIngresos.subtract(totalGastosFijos).subtract(totalGastosVariables);
        List<String> alertas = generarAlertas(totalIngresos, totalGastosFijos, totalGastosVariables, balanceNeto);
        List<String> recomendaciones = generarRecomendaciones(totalIngresos, totalGastosFijos, totalGastosVariables, balanceNeto);
        return DashboardSummary.builder()
                .totalIngresos(totalIngresos.setScale(2, RoundingMode.HALF_UP))
                .totalGastosFijos(totalGastosFijos.setScale(2, RoundingMode.HALF_UP))
                .totalGastosVariables(totalGastosVariables.setScale(2, RoundingMode.HALF_UP))
                .balanceNeto(balanceNeto.setScale(2, RoundingMode.HALF_UP))
                .alertas(alertas)
                .recomendaciones(recomendaciones)
                .build();
    }

    private List<String> generarAlertas(BigDecimal ingresos, BigDecimal gastosFijos, BigDecimal gastosVariables, BigDecimal balance) {
        List<String> alertas = new ArrayList<>();
        if (ingresos.compareTo(BigDecimal.ZERO) == 0) {
            alertas.add("No se registran ingresos en el mes actual.");
        }
        if (balance.compareTo(BigDecimal.ZERO) < 0) {
            alertas.add("El balance neto es negativo. Los gastos superan los ingresos.");
        }
        if (ingresos.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal porcentajeGastosFijos = gastosFijos.multiply(BigDecimal.valueOf(100))
                    .divide(ingresos, 1, RoundingMode.HALF_UP);
            if (porcentajeGastosFijos.compareTo(BigDecimal.valueOf(50)) > 0) {
                alertas.add("Los gastos fijos superan el 50% de tus ingresos.");
            }
        }
        if (gastosVariables.compareTo(BigDecimal.ZERO) > 0 && ingresos.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal porcentajeVariables = gastosVariables.multiply(BigDecimal.valueOf(100))
                    .divide(ingresos, 1, RoundingMode.HALF_UP);
            if (porcentajeVariables.compareTo(BigDecimal.valueOf(70)) > 0) {
                alertas.add("Los gastos variables superan el 70% de tus ingresos.");
            }
        }
        return alertas;
    }

    private List<String> generarRecomendaciones(BigDecimal ingresos, BigDecimal gastosFijos, BigDecimal gastosVariables, BigDecimal balance) {
        List<String> recomendaciones = new ArrayList<>();

        if (balance.compareTo(BigDecimal.ZERO) < 0) {
            recomendaciones.add("Revisa tus gastos y prioriza los esenciales para volver al equilibrio.");
        } else if (balance.compareTo(BigDecimal.ZERO) == 0) {
            recomendaciones.add("Estás gastando exactamente lo que ingresas. Intenta ahorrar al menos un 10%.");
        } else {
            BigDecimal porcentajeAhorro = balance.multiply(BigDecimal.valueOf(100))
                    .divide(ingresos, 1, RoundingMode.HALF_UP);
            if (porcentajeAhorro.compareTo(BigDecimal.valueOf(20)) < 0) {
                recomendaciones.add("Tu ahorro es menor al 20%. Intenta reducir gastos variables.");
            } else {
                recomendaciones.add("Buen trabajo con tu ahorro. Considera invertir parte de tu balance.");
            }
        }
        if (gastosFijos.compareTo(BigDecimal.ZERO) > 0 && ingresos.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratioDeuda = gastosFijos.divide(ingresos, 2, RoundingMode.HALF_UP);
            if (ratioDeuda.compareTo(BigDecimal.valueOf(0.4)) > 0) {
                recomendaciones.add("Tus deudas consumen más del 40% de tus ingresos. Evalúa refinanciar.");
            }
        }
        if (recomendaciones.isEmpty()) {
            recomendaciones.add("Mantén tus hábitos financieros actuales.");
        }
        return recomendaciones;
    }
}
