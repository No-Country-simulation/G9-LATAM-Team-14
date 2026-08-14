package com.g9latam.team14.movement.infrastructure.adapter.outbound.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserEntity;
import com.g9latam.team14.auth.infrastructure.adapter.outbound.database.UserJpaRepository;
import com.g9latam.team14.movement.domain.model.AiAlternativeCategory;
import com.g9latam.team14.movement.domain.model.AiClassification;
import com.g9latam.team14.movement.domain.ports.outbound.AiServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DsServiceAdapter implements AiServicePort {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final UserJpaRepository userJpaRepository;

    @Value("${ds.service.url:http://python-data-science:8000}")
    private String dsServiceUrl;

    @Override
    public AiClassification classifyMovement(String description, double amount, String direction, String note) {
        String cleanDirection = normalizeDirection(direction);
        String url = dsServiceUrl + "/api/v1/transactions/classify/";
        Map<String, Object> profileCtx = buildProfileContext();

        Map<String, Object> payload = new HashMap<>();
        payload.put("description", description != null ? description : "");
        payload.put("amount", amount);
        payload.put("direction", cleanDirection);
        payload.put("note", note != null ? note : "");
        payload.put("profile_context", profileCtx);

        try {
            String jsonBody = objectMapper.writeValueAsString(payload);
            byte[] bodyBytes = jsonBody.getBytes(java.nio.charset.StandardCharsets.UTF_8);

            HttpHeaders headers = createHeaders();
            headers.setContentLength(bodyBytes.length);

            HttpEntity<byte[]> request = new HttpEntity<>(bodyBytes, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            if (response.getBody() == null || response.getBody().isBlank()) {
                return emptyFallback(cleanDirection);
            }

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode target = rootNode.has("model_suggestion") ? rootNode.get("model_suggestion") : rootNode;

            String category = extractCategory(target);
            double confidence = extractConfidence(target);
            String purpose = target.path("purpose").asText(target.path("suggested_purpose").asText(""));
            String regularity = target.path("regularity").asText(target.path("suggested_regularity").asText(""));
            boolean requiresReview = target.path("requires_confirmation").asBoolean(target.path("model_requires_review").asBoolean(false));

            List<AiAlternativeCategory> alternatives = extractAlternatives(target, category);

            return AiClassification.builder()
                    .category(category)
                    .categoryConfidencePercentage(confidence)
                    .alternativeCategories(alternatives)
                    .purpose(purpose)
                    .regularity(regularity)
                    .modelRequiresReview(requiresReview)
                    .build();
        } catch (Exception e) {
            log.warn("No se pudo conectar al servicio de Inferencia DS (Modelo 2): {}", e.getMessage());
            return emptyFallback(cleanDirection);
        }
    }

    private Map<String, Object> buildProfileContext() {
        Map<String, Object> ctx = new HashMap<>();
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                Optional<UserEntity> userOpt = userJpaRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    UserEntity user = userOpt.get();
                    if (user.getIngresoMensual() != null) {
                        ctx.put("monthly_income", user.getIngresoMensual().doubleValue());
                    }
                    if (user.getFrecuenciaAhorro() != null) {
                        ctx.put("saving_habit", user.getFrecuenciaAhorro());
                    }
                }
            }
        } catch (Exception e) {
            log.debug("No se pudo obtener el contexto de perfil para Modelo 2: {}", e.getMessage());
        }
        return ctx;
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-FinCoach-Request", "1");
        return headers;
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
                .category("")
                .categoryConfidencePercentage(0.0)
                .alternativeCategories(List.of())
                .purpose("")
                .regularity("")
                .modelRequiresReview(true)
                .build();
    }
}
