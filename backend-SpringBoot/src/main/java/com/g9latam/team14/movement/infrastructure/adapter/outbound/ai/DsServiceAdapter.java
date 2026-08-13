package com.g9latam.team14.movement.infrastructure.adapter.outbound.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.g9latam.team14.movement.domain.model.AiAlternativeCategory;
import com.g9latam.team14.movement.domain.model.AiClassification;
import com.g9latam.team14.movement.domain.ports.outbound.AiServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DsServiceAdapter implements AiServicePort {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ds.service.url:http://python-data-science:8000}")
    private String dsServiceUrl;

    @Override
    public AiClassification classifyMovement(String description, double amount, String direction, String note) {
        String cleanDirection = normalizeDirection(direction);

        try {
            long transactionId = registerTransactionInDs(description, amount, cleanDirection, note);
            if (transactionId <= 0) {
                return emptyFallback(cleanDirection);
            }

            return fetchClassificationResult(transactionId, cleanDirection);
        } catch (Exception e) {
            log.warn("No se pudo conectar al servicio de Inferencia DS: {}", e.getMessage());
            return emptyFallback(cleanDirection);
        }
    }

    private String normalizeDirection(String direction) {
        if ("INGRESO".equalsIgnoreCase(direction)) {
            return "entrada";
        }
        if ("GASTO".equalsIgnoreCase(direction) || "EGRESO".equalsIgnoreCase(direction)) {
            return "salida";
        }
        return (direction != null && !direction.isBlank()) ? direction : "salida";
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-FinCoach-Request", "1");
        return headers;
    }

    private long registerTransactionInDs(String description, double amount, String direction, String note) throws Exception {
        String url = dsServiceUrl + "/api/v1/transactions/";
        Map<String, Object> payload = Map.of(
                "transaction_date", LocalDate.now().toString(),
                "description", description != null ? description : "",
                "amount", amount,
                "direction", direction,
                "note", note != null ? note : ""
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, createHeaders());
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        if (response.getBody() == null || response.getBody().isBlank()) {
            return 0;
        }

        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("transaction").path("id").asLong(0);
    }

    private AiClassification fetchClassificationResult(long transactionId, String direction) throws Exception {
        String url = dsServiceUrl + "/api/v1/transactions/" + transactionId + "/classify/";
        HttpEntity<Void> request = new HttpEntity<>(createHeaders());
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        if (response.getBody() == null || response.getBody().isBlank()) {
            return emptyFallback(direction);
        }

        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode target = rootNode.has("model_suggestion") ? rootNode.get("model_suggestion") : rootNode;

        String category = extractCategory(target);
        double confidence = extractConfidence(target);
        String purpose = target.path("purpose").asText(target.path("suggested_purpose").asText(""));
        String regularity = target.path("regularity").asText(target.path("suggested_regularity").asText(""));
        boolean requiresReview = target.path("model_requires_review").asBoolean(target.path("requires_confirmation").asBoolean(false));

        List<AiAlternativeCategory> alternatives = extractAlternatives(target, category);

        return AiClassification.builder()
                .category(category)
                .categoryConfidencePercentage(confidence)
                .alternativeCategories(alternatives)
                .purpose(purpose)
                .regularity(regularity)
                .modelRequiresReview(requiresReview)
                .build();
    }

    private String extractCategory(JsonNode target) {
        String cat = target.path("category").asText("");
        if (cat.isBlank() && target.has("suggested_categories") && target.get("suggested_categories").isArray()) {
            JsonNode first = target.get("suggested_categories").get(0);
            if (first != null) {
                cat = first.path("category").asText("");
            }
        }
        return cat;
    }

    private double extractConfidence(JsonNode target) {
        double confidence = 0.0;
        if (target.has("category_confidence_percentage")) {
            confidence = target.get("category_confidence_percentage").asDouble();
        } else if (target.has("model_confidence_pct")) {
            confidence = target.get("model_confidence_pct").asDouble();
        }
        return (confidence > 0 && confidence <= 1.0) ? confidence * 100.0 : confidence;
    }

    private List<AiAlternativeCategory> extractAlternatives(JsonNode target, String mainCategory) {
        List<AiAlternativeCategory> list = new ArrayList<>();
        JsonNode altNode = target.has("alternative_categories") ? target.get("alternative_categories") : target.get("suggested_categories");

        if (altNode != null && altNode.isArray()) {
            for (JsonNode alt : altNode) {
                String altCat = alt.path("category").asText("");
                double altPct = alt.path("percentage").asDouble(0.0);
                if (altPct > 0 && altPct <= 1.0) {
                    altPct *= 100.0;
                }
                if (!altCat.isBlank() && !altCat.equalsIgnoreCase(mainCategory)) {
                    list.add(AiAlternativeCategory.builder()
                            .category(altCat)
                            .percentage(altPct)
                            .build());
                }
            }
        }
        return list;
    }

    private AiClassification emptyFallback(String direction) {
        boolean isIncome = "entrada".equalsIgnoreCase(direction) || "INGRESO".equalsIgnoreCase(direction);
        return AiClassification.builder()
                .category(isIncome ? "OTRO_INGRESO" : "OTRO_GASTO")
                .categoryConfidencePercentage(0.0)
                .alternativeCategories(List.of())
                .purpose("")
                .regularity("")
                .modelRequiresReview(true)
                .build();
    }
}
