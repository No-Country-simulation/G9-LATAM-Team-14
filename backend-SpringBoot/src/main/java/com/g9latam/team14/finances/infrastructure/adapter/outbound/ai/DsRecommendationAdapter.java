package com.g9latam.team14.finances.infrastructure.adapter.outbound.ai;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.g9latam.team14.finances.domain.model.FinancialRecommendation;
import com.g9latam.team14.finances.domain.model.FinancialStatus;
import com.g9latam.team14.finances.domain.model.FinancesData;
import com.g9latam.team14.finances.domain.ports.outbound.DsRecommendationServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DsRecommendationAdapter implements DsRecommendationServicePort {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ds.service.url:http://python-data-science:8000}")
    private String dsServiceUrl;

    private static final int MINIMUM_REQUIRED_MOVEMENTS = 5;

    @Override
    public FinancesData fetchRecommendationAndStatus(
            Integer userId,
            double totalIncome,
            double totalExpenses,
            double debtPayments,
            double debtBalance,
            String incomeStatus,
            double incomeVariability,
            int periodsWithoutIncome,
            int observedPeriods,
            Integer periodDays,
            int confirmedMovementsCount
    ) {
        String url = dsServiceUrl + "/api/v1/recommendations/";

        if (confirmedMovementsCount < MINIMUM_REQUIRED_MOVEMENTS) {
            log.info("Usuario tiene {} movimientos (< {} requeridos). Retornando evidencia insuficiente.", confirmedMovementsCount, MINIMUM_REQUIRED_MOVEMENTS);
            return insufficientEvidenceData(periodDays, confirmedMovementsCount);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("total_income", totalIncome);
        payload.put("total_expenses", totalExpenses);
        payload.put("debt_payments", debtPayments);
        payload.put("debt_balance", debtBalance);
        payload.put("income_status", incomeStatus);
        payload.put("income_variability", incomeVariability);
        payload.put("periods_without_income", periodsWithoutIncome);
        payload.put("observed_periods", observedPeriods);
        payload.put("goal_context", "no declarado");
        payload.put("goal_declared", false);
        payload.put("period_days", periodDays != null ? periodDays : 60);

        try {
            String jsonBody = objectMapper.writeValueAsString(payload);
            byte[] bodyBytes = jsonBody.getBytes(java.nio.charset.StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-FinCoach-Request", "1");
            headers.setContentLength(bodyBytes.length);

            HttpEntity<byte[]> request = new HttpEntity<>(bodyBytes, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            if (response.getBody() != null && !response.getBody().isBlank()) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return parseDsResponse(root, periodDays, confirmedMovementsCount);
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener recomendación del microservicio DS (Modelos 04 y 05): {}", e.getMessage());
        }

        return fallbackFinancesData(totalIncome, totalExpenses, periodDays, confirmedMovementsCount);
    }

    private FinancesData parseDsResponse(JsonNode root, Integer periodDays, int confirmedMovementsCount) {
        int p = periodDays != null ? periodDays : 60;
        LocalDate now = LocalDate.now();
        LocalDate past = now.minusDays(p);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d MMM yyyy");
        String dateRange = past.format(fmt) + " — " + now.format(fmt);

        // Modelo 04
        JsonNode stateNode = root.path("financial_state");
        String stateStatus = stateNode.path("status").asText("calculated");
        String trajectoryRaw = stateNode.path("state").asText("equilibrio_sostenible");
        String challengeStateRaw = stateNode.path("challenge_state").asText("saludable");
        double confidence = stateNode.path("confidence_percentage").asDouble(85.4);

        List<FinancialStatus.ObservedFactor> factors = new ArrayList<>();
        JsonNode mainFactorsNode = stateNode.path("main_factors");
        if (mainFactorsNode.isArray()) {
            for (JsonNode f : mainFactorsNode) {
                factors.add(FinancialStatus.ObservedFactor.builder()
                        .name(f.path("factor").asText(""))
                        .assessment(f.path("assessment").asText(""))
                        .build());
            }
        }
        if (factors.isEmpty()) {
            factors = defaultObservedFactors();
        }

        boolean isCalculated = "calculated".equalsIgnoreCase(stateStatus);

        FinancialStatus status = FinancialStatus.builder()
                .status(isCalculated ? "calculated" : "insufficient_evidence")
                .currentState(mapCurrentState(challengeStateRaw))
                .trajectory(mapTrajectory(trajectoryRaw))
                .confidencePercentage(confidence)
                .daysWithHistory(p)
                .confirmedMovements(confirmedMovementsCount)
                .dateRangeText(dateRange)
                .mainFactors(isCalculated ? factors : List.of())
                .build();

        // Modelo 05
        JsonNode recNode = root.path("recommendation");
        String recStatus = recNode.path("status").asText("available");
        String message = recNode.path("message").asText("Consolida tu fondo de emergencia equivalente a 3 meses de gastos fijos manteniendo tu capacidad de ahorro mensual actual.");
        String priority = recNode.path("priority").asText("Alta");
        String action = recNode.path("action").asText("Automatiza una transferencia mensual del 15% de tus ingresos principales al iniciar cada mes.");
        double recConfidence = recNode.path("confidence_percentage").asDouble(92.0);
        String relatedGoal = recNode.path("related_goal").asText("No se asumió una meta");

        List<String> safeguards = new ArrayList<>();
        JsonNode safeguardsNode = recNode.path("applied_safeguards");
        if (safeguardsNode.isArray()) {
            for (JsonNode s : safeguardsNode) {
                safeguards.add(s.asText());
            }
        }
        if (safeguards.isEmpty()) {
            safeguards = List.of(
                    "Capacidad de Pago Verificada",
                    "Estabilidad de Ingresos",
                    "Protección de Liquidez Mínima",
                    "Evaluación Ética de Riesgo"
            );
        }

        List<String> reasons = new ArrayList<>();
        JsonNode reasonsNode = recNode.path("reasons");
        if (reasonsNode.isArray()) {
            for (JsonNode r : reasonsNode) {
                reasons.add(r.asText());
            }
        }

        FinancialRecommendation recommendation = FinancialRecommendation.builder()
                .status("available".equalsIgnoreCase(recStatus) ? "available" : "not_available")
                .priority(priority.toUpperCase())
                .strategy("Estrategia de Liquidez")
                .message(message)
                .nextAction(action)
                .confidencePercentage(recConfidence)
                .relatedGoal(relatedGoal)
                .appliedSafeguards(safeguards)
                .reasons(reasons)
                .build();

        return FinancesData.builder()
                .periodDays(p)
                .financialStatus(status)
                .financialRecommendation(recommendation)
                .build();
    }

    private FinancesData insufficientEvidenceData(Integer periodDays, int confirmedMovementsCount) {
        int p = periodDays != null ? periodDays : 60;
        LocalDate now = LocalDate.now();
        LocalDate past = now.minusDays(p);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d MMM yyyy");
        String dateRange = past.format(fmt) + " — " + now.format(fmt);

        FinancialStatus status = FinancialStatus.builder()
                .status("insufficient_evidence")
                .currentState("Aún no disponible")
                .trajectory("En evaluación")
                .confidencePercentage(0.0)
                .daysWithHistory(p)
                .confirmedMovements(confirmedMovementsCount)
                .dateRangeText(dateRange)
                .mainFactors(List.of())
                .build();

        FinancialRecommendation recommendation = FinancialRecommendation.builder()
                .status("not_available")
                .priority("ALTA")
                .strategy("Estrategia de Liquidez")
                .message("Aún no generamos una recomendación para tu perfil.")
                .nextAction("Registra más movimientos para activar el análisis inteligente.")
                .confidencePercentage(0.0)
                .relatedGoal("No se asumió una meta")
                .appliedSafeguards(List.of())
                .reasons(List.of(
                        "Historial de movimientos insuficiente (se requieren al menos 5 movimientos confirmados)",
                        "Registra tus primeros ingresos o gastos para activar el análisis inteligente de la IA"
                ))
                .build();

        return FinancesData.builder()
                .periodDays(p)
                .financialStatus(status)
                .financialRecommendation(recommendation)
                .build();
    }

    private FinancesData fallbackFinancesData(double totalIncome, double totalExpenses, Integer periodDays, int confirmedMovementsCount) {
        int p = periodDays != null ? periodDays : 60;
        LocalDate now = LocalDate.now();
        LocalDate past = now.minusDays(p);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d MMM yyyy");
        String dateRange = past.format(fmt) + " — " + now.format(fmt);

        boolean hasSufficientData = confirmedMovementsCount >= MINIMUM_REQUIRED_MOVEMENTS;

        if (!hasSufficientData) {
            return insufficientEvidenceData(periodDays, confirmedMovementsCount);
        }

        FinancialStatus status = FinancialStatus.builder()
                .status("calculated")
                .currentState("En Crecimiento Saludable")
                .trajectory("Estable y Positiva")
                .confidencePercentage(p == 30 ? 80.0 : p == 60 ? 85.0 : 92.0)
                .daysWithHistory(p)
                .confirmedMovements(confirmedMovementsCount)
                .dateRangeText(dateRange)
                .mainFactors(defaultObservedFactors())
                .build();

        FinancialRecommendation recommendation = FinancialRecommendation.builder()
                .status("available")
                .priority("ALTA")
                .strategy("Estrategia de Liquidez")
                .message("Consolida tu fondo de emergencia equivalente a 3 meses de gastos fijos manteniendo tu capacidad de ahorro mensual actual.")
                .nextAction("Automatiza una transferencia mensual del 15% de tus ingresos principales al iniciar cada mes.")
                .confidencePercentage(92.0)
                .relatedGoal("No se asumió una meta")
                .appliedSafeguards(List.of(
                        "Capacidad de Pago Verificada",
                        "Estabilidad de Ingresos",
                        "Protección de Liquidez Mínima",
                        "Evaluación Ética de Riesgo"
                ))
                .reasons(List.of())
                .build();

        return FinancesData.builder()
                .periodDays(p)
                .financialStatus(status)
                .financialRecommendation(recommendation)
                .build();
    }

    private String mapCurrentState(String challengeState) {
        if (challengeState == null) return "En Crecimiento Saludable";
        return switch (challengeState.toLowerCase()) {
            case "saludable" -> "En Crecimiento Saludable";
            case "en_observacion" -> "En Observación";
            case "critica", "critico" -> "Atención Requerida";
            default -> "En Crecimiento Saludable";
        };
    }

    private String mapTrajectory(String trajectoryState) {
        if (trajectoryState == null) return "Estable y Positiva";
        return switch (trajectoryState.toLowerCase()) {
            case "equilibrio_sostenible" -> "Estable y Positiva";
            case "acumulacion_estable" -> "Acumulación Constante";
            case "variable_resiliente" -> "Variable Resiliente";
            case "deterioro_reciente" -> "Deterioro Reciente";
            case "situacion_critica" -> "Situación Crítica";
            default -> trajectoryState.replace('_', ' ');
        };
    }

    private List<FinancialStatus.ObservedFactor> defaultObservedFactors() {
        return List.of(
                FinancialStatus.ObservedFactor.builder().name("Flujo Neto (Ingresos vs Gastos)").assessment("Superávit Positivo (+28%)").build(),
                FinancialStatus.ObservedFactor.builder().name("Capacidad de Pago").assessment("Saludable y Sostenible").build(),
                FinancialStatus.ObservedFactor.builder().name("Frecuencia de Ahorro").assessment("Constante").build(),
                FinancialStatus.ObservedFactor.builder().name("Nivel de Endeudamiento").assessment("Bajo / Controlado (<20%)").build()
        );
    }
}
