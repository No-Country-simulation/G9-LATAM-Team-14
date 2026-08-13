package com.g9latam.team14.transaction.infrastructure.adapter.outbound.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.g9latam.team14.transaction.domain.model.CategoryPercentage;
import com.g9latam.team14.transaction.domain.model.Transaction;
import com.g9latam.team14.transaction.domain.model.TransactionStatus;
import com.g9latam.team14.transaction.domain.ports.outbound.AiServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DsTransactionServiceAdapter implements AiServicePort {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ds.service.url:http://127.0.0.1:8000}")
    private String dsServiceUrl;

    @Override
    public Transaction classifyTransaction(Transaction transaction) {

        String url = dsServiceUrl
                + "/api/v1/movements/classify/";

        log.info(
                "Enviando transacción {} a Data Science: {}",
                transaction.getId(),
                url
        );

        DsMovementClassificationRequest request =
                new DsMovementClassificationRequest(
                        transaction.getDescription(),
                        transaction.getAmount(),
                        transaction.getDirection() != null
                                ? transaction.getDirection().getValue()
                                : "salida",
                        transaction.getNote() != null
                                ? transaction.getNote()
                                : ""
                );

        log.info(
                "Clasificación request: description={}, amount={}, direction={}, note={}",
                request.description(),
                request.amount(),
                request.direction(),
                request.note()
        );

        DsTransactionClassificationResponse body;

        try {
            // Serializar DTO a JSON String para evitar Transfer-Encoding: chunked
            String json = objectMapper.writeValueAsString(request);

            byte[] jsonBytes = json.getBytes(StandardCharsets.UTF_8);

            log.debug("JSON serializado: {}", json);
            log.debug("Content-Length: {} bytes", jsonBytes.length);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentLength(jsonBytes.length);

            HttpEntity<String> entity = new HttpEntity<>(json, headers);

            ResponseEntity<DsTransactionClassificationResponse> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            entity,
                            DsTransactionClassificationResponse.class
                    );

            body = response.getBody();

            if (body == null) {
                throw new IllegalStateException(
                        "El servicio de Data Science no devolvió una respuesta"
                );
            }

        } catch (Exception e) {
            log.error("Error durante la clasificación de transacción", e);
            throw new IllegalStateException(
                    "Error al serializar o enviar request a Data Science: " + e.getMessage(),
                    e
            );
        }

        List<CategoryPercentage> topCategories =
                body.alternativeCategories() != null
                        ? body.alternativeCategories()
                        .stream()
                        .map(category ->
                                CategoryPercentage.builder()
                                        .category(category.category())
                                        .percentage(
                                                category.percentage() != null
                                                        ? BigDecimal.valueOf(
                                                        category.percentage()
                                                )
                                                        : BigDecimal.ZERO
                                        )
                                        .build()
                        )
                        .toList()
                        : List.of();

        return Transaction.builder()
                .id(transaction.getId())
                .userId(transaction.getUserId())
                .financialProfileId(transaction.getFinancialProfileId())

                .transactionDate(transaction.getTransactionDate())
                .description(transaction.getDescription())
                .note(transaction.getNote())

                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .direction(transaction.getDirection())

                .status(TransactionStatus.AWAITING_CONFIRMATION)

                .movementType(transaction.getMovementType())

                .modelCategory(body.category())
                .modelPurpose(body.purpose())

                .modelCategoryConfidencePercentage(
                        body.categoryConfidencePercentage() != null
                                ? BigDecimal.valueOf(
                                body.categoryConfidencePercentage()
                        )
                                : null
                )

                .modelPurposeConfidencePercentage(null)

                .modelRegularity(body.regularity())

                .modelRegularityConfidencePercentage(null)

                .modelRequiresConfirmation(
                        body.modelRequiresReview()
                )

                .modelConfirmationProbabilityPercentage(null)

                .modelTopCategories(topCategories)

                .modelCategoryPercentages(null)

                .modelCategoryPurposePairValid(null)

                .modelRule(null)
                .modelVersion(null)
                .modelResult(null)

                // Preserve current user decisions and history
                .currentCategories(transaction.getCurrentCategories())
                .currentPurpose(transaction.getCurrentPurpose())
                .currentRegularity(transaction.getCurrentRegularity())
                .classificationSource(transaction.getClassificationSource())
                .firstUserDecision(transaction.getFirstUserDecision())
                .decisionHistory(transaction.getDecisionHistory())
                .firstDecidedAt(transaction.getFirstDecidedAt())
                .lastCorrectedAt(transaction.getLastCorrectedAt())
                .revisionCount(transaction.getRevisionCount())

                // Preserve timestamps
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())

                .build();
    }
}