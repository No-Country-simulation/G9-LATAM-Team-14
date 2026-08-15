package com.g9latam.team14.evolucion.domain.ports.outbound;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Map;
public interface DatosFinancierosPort {
    Map<YearMonth, BigDecimal> ingresosAgrupados(Integer usuarioId, YearMonth desde, YearMonth hasta);
    Map<YearMonth, BigDecimal> gastosAgrupados(Integer usuarioId, YearMonth desde, YearMonth hasta);
    Map<YearMonth, BigDecimal> deudasAgrupadas(Integer usuarioId, YearMonth desde, YearMonth hasta);
    Map<LocalDate, BigDecimal> ingresosDiarios(Integer usuarioId, LocalDate desde, LocalDate hasta);
    Map<LocalDate, BigDecimal> gastosDiarios(Integer usuarioId, LocalDate desde, LocalDate hasta);
}
