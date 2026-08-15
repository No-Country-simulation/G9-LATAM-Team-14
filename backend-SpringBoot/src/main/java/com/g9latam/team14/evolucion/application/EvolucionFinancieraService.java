package com.g9latam.team14.evolucion.application;

import com.g9latam.team14.evolucion.domain.model.DatosEvolucion;
import com.g9latam.team14.evolucion.domain.model.EvaluacionHistorica;
import com.g9latam.team14.evolucion.domain.model.FlujoDineroMes;
import com.g9latam.team14.evolucion.domain.model.PerfilMensual;
import com.g9latam.team14.evolucion.domain.model.PuntuacionDiaria;
import com.g9latam.team14.evolucion.domain.ports.inbound.GenerarEvolucionUseCase;
import com.g9latam.team14.evolucion.domain.ports.outbound.DatosFinancierosPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EvolucionFinancieraService implements GenerarEvolucionUseCase {

    private final DatosFinancierosPort datosFinancierosPort;

    @Override
    public DatosEvolucion generar(Integer usuarioId) {
        YearMonth mesActual = YearMonth.now();
        YearMonth mesInicio = mesActual.minusMonths(5);

        Map<YearMonth, BigDecimal> ingresos = datosFinancierosPort.ingresosAgrupados(usuarioId, mesInicio, mesActual);
        Map<YearMonth, BigDecimal> gastos = datosFinancierosPort.gastosAgrupados(usuarioId, mesInicio, mesActual);
        Map<YearMonth, BigDecimal> deudas = datosFinancierosPort.deudasAgrupadas(usuarioId, mesInicio, mesActual);

        Map<LocalDate, BigDecimal> ingresosDiariosMap = datosFinancierosPort.ingresosDiarios(usuarioId, mesInicio.atDay(1), LocalDate.now());
        Map<LocalDate, BigDecimal> gastosDiariosMap = datosFinancierosPort.gastosDiarios(usuarioId, mesInicio.atDay(1), LocalDate.now());

        List<PerfilMensual> perfilMensual = new ArrayList<>();
        List<FlujoDineroMes> ingresosVsGastos = new ArrayList<>();

        YearMonth cursor = mesInicio;
        while (!cursor.isAfter(mesActual)) {
            BigDecimal ing = ingresos.getOrDefault(cursor, BigDecimal.ZERO);
            BigDecimal gas = gastos.getOrDefault(cursor, BigDecimal.ZERO);
            BigDecimal deu = deudas.getOrDefault(cursor, BigDecimal.ZERO);

            boolean esMesActual = cursor.equals(mesActual);
            boolean sinInteraccion = ing.compareTo(BigDecimal.ZERO) == 0 && gas.compareTo(BigDecimal.ZERO) == 0 && deu.compareTo(BigDecimal.ZERO) == 0;

            int score = calcularScore(ing, gas, deu);
            String estado;

            if (esMesActual) {
                estado = "En observación";
            } else if (sinInteraccion) {
                estado = "-";
                score = 0;
            } else {
                estado = score > 50 ? "Saludable" : "En riesgo";
            }

            List<PuntuacionDiaria> puntuacionesDiarias = calcularPuntuacionesDiarias(cursor, ingresosDiariosMap, gastosDiariosMap, deu);

            perfilMensual.add(new PerfilMensual(cursor.toString(), score, estado, puntuacionesDiarias));
            ingresosVsGastos.add(new FlujoDineroMes(cursor.toString(), ing, gas, deu));
            cursor = cursor.plusMonths(1);
        }

        int ultimoScore = perfilMensual.isEmpty() ? 0 : perfilMensual.get(perfilMensual.size() - 1).score();
        List<EvaluacionHistorica> historial = construirHistorial(perfilMensual, ingresosVsGastos);

        return new DatosEvolucion(mesActual.toString(), ultimoScore, perfilMensual, ingresosVsGastos, historial);
    }

    private List<PuntuacionDiaria> calcularPuntuacionesDiarias(
            YearMonth mes,
            Map<LocalDate, BigDecimal> ingresosDiarios,
            Map<LocalDate, BigDecimal> gastosDiarios,
            BigDecimal deudasMes
    ) {
        List<PuntuacionDiaria> resultado = new ArrayList<>();
        LocalDate hoy = LocalDate.now();
        int finDia = mes.equals(YearMonth.now()) ? hoy.getDayOfMonth() : mes.lengthOfMonth();

        BigDecimal acumIng = BigDecimal.ZERO;
        BigDecimal acumGas = BigDecimal.ZERO;

        for (int dia = 1; dia <= finDia; dia++) {
            LocalDate fechaActual = mes.atDay(dia);
            BigDecimal ingDia = ingresosDiarios.getOrDefault(fechaActual, BigDecimal.ZERO);
            BigDecimal gasDia = gastosDiarios.getOrDefault(fechaActual, BigDecimal.ZERO);

            acumIng = acumIng.add(ingDia);
            acumGas = acumGas.add(gasDia);

            BigDecimal deudasHastaDia = deudasMes.multiply(BigDecimal.valueOf(dia))
                    .divide(BigDecimal.valueOf(mes.lengthOfMonth()), 2, RoundingMode.HALF_UP);

            int scoreDia = calcularScore(acumIng, acumGas, deudasHastaDia);

            resultado.add(new PuntuacionDiaria(
                    String.format(Locale.ROOT, "%02d", dia),
                    scoreDia,
                    acumIng,
                    acumGas
            ));
        }
        return resultado;
    }

    private int calcularScore(BigDecimal ingresos, BigDecimal gastos, BigDecimal deudas) {
        if (ingresos == null || ingresos.compareTo(BigDecimal.ZERO) <= 0) return 50;
        BigDecimal egresos = gastos.add(deudas);
        if (egresos.compareTo(BigDecimal.ZERO) == 0) return 100;
        BigDecimal pct = ingresos.subtract(egresos)
                .multiply(BigDecimal.valueOf(100))
                .divide(ingresos, 0, RoundingMode.HALF_UP);
        return Math.max(0, Math.min(100, pct.intValue()));
    }

    private List<EvaluacionHistorica> construirHistorial(List<PerfilMensual> perfiles, List<FlujoDineroMes> flujos) {
        List<EvaluacionHistorica> lista = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy", Locale.forLanguageTag("es"));
        int limite = Math.min(6, perfiles.size());
        for (int i = perfiles.size() - 1; i >= 0 && lista.size() < limite; i--) {
            PerfilMensual p = perfiles.get(i);
            FlujoDineroMes f = flujos.get(i);
            lista.add(new EvaluacionHistorica(
                    YearMonth.parse(p.mes()).format(fmt),
                    p.estado(),
                    p.score(),
                    f.ingresos().setScale(2, RoundingMode.HALF_UP),
                    f.gastos().setScale(2, RoundingMode.HALF_UP)
            ));
        }
        return lista;
    }
}
