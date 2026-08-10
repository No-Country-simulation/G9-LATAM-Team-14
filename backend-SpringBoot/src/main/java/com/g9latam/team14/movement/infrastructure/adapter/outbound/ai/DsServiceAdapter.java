package com.g9latam.team14.movement.infrastructure.adapter.outbound.ai;

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

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DsServiceAdapter implements AiServicePort {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ds.service.url:http://127.0.0.1:8001}")
    private String dsServiceUrl;

    @Override
    public AiClassification classifyMovement(String description, double amount, String direction, String note) {
        try {
            String url = dsServiceUrl + "/api/v1/movements/classify/";
            Map<String, Object> payload = Map.of(
                    "description", description,
                    "amount", amount,
                    "direction", direction != null ? direction : "salida",
                    "note", note != null ? note : ""
            );
            byte[] bodyBytes = objectMapper.writeValueAsBytes(payload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentLength(bodyBytes.length);

            HttpEntity<byte[]> entity = new HttpEntity<>(bodyBytes, headers);

            ResponseEntity<DsClassificationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    DsClassificationResponse.class
            );

            DsClassificationResponse body = response.getBody();
            if (body == null) {
                return fallbackClassification(direction);
            }

            List<AiAlternativeCategory> alternatives = body.alternativeCategories() != null
                    ? body.alternativeCategories().stream()
                          .map(a -> AiAlternativeCategory.builder()
                                  .category(a.category())
                                  .percentage(a.percentage())
                                  .build())
                          .toList()
                    : List.of();

            return AiClassification.builder()
                    .category(body.category())
                    .categoryConfidencePercentage(body.categoryConfidencePercentage())
                    .alternativeCategories(alternatives)
                    .purpose(body.purpose())
                    .regularity(body.regularity())
                    .modelRequiresReview(body.modelRequiresReview())
                    .build();

        } catch (Exception e) {
            log.warn("No se pudo conectar al servicio de IA (ds-service). Usando clasificación por defecto. Error: {}", e.getMessage());
            return fallbackClassification(direction);
        }
    }

    private AiClassification fallbackClassification(String direction) {
        boolean isIncome = "entrada".equalsIgnoreCase(direction) || "INGRESO".equalsIgnoreCase(direction);
        return AiClassification.builder()
                .category(isIncome ? "OTRO_INGRESO" : "OTRO_GASTO")
                .categoryConfidencePercentage(0.0)
                .alternativeCategories(List.of())
                .purpose("No determinado")
                .regularity("variable")
                .modelRequiresReview(true)
                .build();
    }
}
