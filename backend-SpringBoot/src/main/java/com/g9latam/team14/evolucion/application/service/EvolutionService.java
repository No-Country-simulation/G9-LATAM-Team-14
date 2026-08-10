package com.g9latam.team14.evolucion.application.service;

import com.g9latam.team14.evolucion.domain.model.AnalysisHistoryRow;
import com.g9latam.team14.evolucion.domain.model.CategoryExpense;
import com.g9latam.team14.evolucion.domain.model.EvolutionData;
import com.g9latam.team14.evolucion.domain.model.IncomeVsExpensesPoint;
import com.g9latam.team14.evolucion.domain.model.MonthlyProfile;
import com.g9latam.team14.evolucion.domain.ports.inbound.GetEvolutionUseCase;
import com.g9latam.team14.evolucion.domain.ports.outbound.EvolutionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EvolutionService implements GetEvolutionUseCase {

    private static final int SCORE_BASE_NEUTRO = 50;
    private static final int MAX_HISTORIAL = 4;
    private static final Map<String, Integer> MESES_POR_RANGO = Map.of(
            "3M", 3,
            "6M", 6,
            "1A", 12
    );
    private static final String[] NOMBRES_MES = {
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
    };

    private final EvolutionRepositoryPort evolutionRepositoryPort;

    @Override
    public EvolutionData getEvolution(Integer userId, String rango) {
        int cantidadMeses = MESES_POR_RANGO.getOrDefault(rango, 6);
        YearMonth ultimoMes = YearMonth.now();
        YearMonth inicio = ultimoMes.minusMonths(cantidadMeses - 1L);

        Map<String, BigDecimal> ingresos = new LinkedHashMap<>();
        evolutionRepositoryPort.sumIngresosMensuales(userId, inicio, ultimoMes)
                .forEach(m -> ingresos.put(m.getMes(), m.getTotal()));

        Map<String, BigDecimal> gastos = new LinkedHashMap<>();
        evolutionRepositoryPort.sumGastosMensuales(userId, inicio, ultimoMes)
                .forEach(m -> gastos.put(m.getMes(), m.getTotal()));

        Map<String, BigDecimal> deudas = new LinkedHashMap<>();
        evolutionRepositoryPort.sumDeudasMensuales(userId, inicio, ultimoMes)
                .forEach(d -> deudas.put(d.mes().toString(), d.total()));

        List<MonthlyProfile> perfilMensual = new ArrayList<>();
        List<IncomeVsExpensesPoint> ingresosVsGastos = new ArrayList<>();

        YearMonth cursor = inicio;
        while (!cursor.isAfter(ultimoMes)) {
            String mes = cursor.toString();
            BigDecimal ingreso = ingresos.getOrDefault(mes, BigDecimal.ZERO);
            BigDecimal gasto = gastos.getOrDefault(mes, BigDecimal.ZERO);
            BigDecimal deuda = deudas.getOrDefault(mes, BigDecimal.ZERO);

            int score = calcularScore(ingreso, gasto, deuda);
            perfilMensual.add(new MonthlyProfile(mes, score, estadoDe(score)));
            ingresosVsGastos.add(new IncomeVsExpensesPoint(mes, ingreso, gasto, deuda));
            cursor = cursor.plusMonths(1);
        }

        int indiceReferencia = indiceUltimoMesConDatos(ingresosVsGastos);
        YearMonth mesReferencia = YearMonth.parse(ingresosVsGastos.get(indiceReferencia).mes());

        BigDecimal gastoTotalMes = gastos.getOrDefault(mesReferencia.toString(), BigDecimal.ZERO);
        BigDecimal gastoMesAnterior = gastos.getOrDefault(
                mesReferencia.minusMonths(1).toString(), BigDecimal.ZERO
        );
        BigDecimal variacionGasto = calcularVariacion(gastoTotalMes, gastoMesAnterior);

        List<CategoryExpense> gastosPorCategoria = construirGastosPorCategoria(
                evolutionRepositoryPort.sumGastosPorCategoria(userId, mesReferencia, mesReferencia),
                gastoTotalMes
        );

        List<AnalysisHistoryRow> historial = construirHistorial(perfilMensual, ingresosVsGastos, indiceReferencia);

        return new EvolutionData(
                rango,
                mesReferencia.toString(),
                perfilMensual.get(indiceReferencia).score(),
                perfilMensual,
                ingresosVsGastos,
                gastosPorCategoria,
                gastoTotalMes.setScale(2, RoundingMode.HALF_UP),
                variacionGasto,
                historial
        );
    }

    private int indiceUltimoMesConDatos(List<IncomeVsExpensesPoint> puntos) {
        for (int i = puntos.size() - 1; i >= 0; i--) {
            IncomeVsExpensesPoint punto = puntos.get(i);
            if (punto.ingresos().signum() > 0 || punto.gastos().signum() > 0) {
                return i;
            }
        }
        return puntos.size() - 1;
    }

    private int calcularScore(BigDecimal ingresos, BigDecimal gastos, BigDecimal deudas) {
        if (ingresos == null || ingresos.compareTo(BigDecimal.ZERO) == 0) {
            return SCORE_BASE_NEUTRO;
        }
        BigDecimal balance = ingresos.subtract(gastos).subtract(deudas);
        BigDecimal ahorroPct = balance.multiply(BigDecimal.valueOf(100))
                .divide(ingresos, 2, RoundingMode.HALF_UP);
        BigDecimal endeudamientoPct = deudas.multiply(BigDecimal.valueOf(100))
                .divide(ingresos, 2, RoundingMode.HALF_UP);

        double excesoEndeudamiento = Math.max(0, endeudamientoPct.doubleValue() - 35);
        double base = 60 + ahorroPct.doubleValue() * 0.4 - excesoEndeudamiento * 0.6;

        int redondeado = (int) Math.round(base);
        return Math.max(0, Math.min(100, redondeado));
    }

    private String estadoDe(int score) {
        if (score >= 85) return "Saludable";
        if (score >= 60) return "En observación";
        return "En riesgo";
    }

    private BigDecimal calcularVariacion(BigDecimal actual, BigDecimal anterior) {
        if (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
        return actual.subtract(anterior)
                .multiply(BigDecimal.valueOf(100))
                .divide(anterior, 1, RoundingMode.HALF_UP);
    }

    private List<CategoryExpense> construirGastosPorCategoria(
            List<com.g9latam.team14.movement.infrastructure.adapter.outbound.database.repository.MovementJpaRepository.CategoryTotal> categorias,
            BigDecimal gastoTotalMes
    ) {
        List<CategoryExpense> resultado = new ArrayList<>();
        for (var c : categorias) {
            BigDecimal total = c.getTotal() != null ? c.getTotal() : BigDecimal.ZERO;
            BigDecimal porcentaje = gastoTotalMes.compareTo(BigDecimal.ZERO) > 0
                    ? total.multiply(BigDecimal.valueOf(100))
                            .divide(gastoTotalMes, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            resultado.add(new CategoryExpense(c.getCategoria(), total.setScale(2, RoundingMode.HALF_UP), porcentaje));
        }
        return resultado;
    }

    private List<AnalysisHistoryRow> construirHistorial(
            List<MonthlyProfile> perfilMensual,
            List<IncomeVsExpensesPoint> ingresosVsGastos,
            int indiceReferencia
    ) {
        List<AnalysisHistoryRow> historial = new ArrayList<>();
        int agregados = 0;
        for (int i = indiceReferencia; i >= 0 && agregados < MAX_HISTORIAL; i--) {
            IncomeVsExpensesPoint punto = ingresosVsGastos.get(i);
            if (punto.ingresos().signum() <= 0 && punto.gastos().signum() <= 0) {
                continue;
            }
            MonthlyProfile perfil = perfilMensual.get(i);
            historial.add(new AnalysisHistoryRow(
                    fechaLabel(perfil.mes()),
                    perfil.estado(),
                    perfil.score(),
                    punto.ingresos().setScale(2, RoundingMode.HALF_UP),
                    punto.gastos().setScale(2, RoundingMode.HALF_UP)
            ));
            agregados++;
        }
        return historial;
    }

    private String fechaLabel(String mes) {
        String[] partes = mes.split("-");
        int mesNumero = Integer.parseInt(partes[1]);
        return "12 " + NOMBRES_MES[mesNumero - 1];
    }
}
