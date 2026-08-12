package com.g9latam.team14.transaction.infrastructure.adapter.outbound.ai;

import com.g9latam.team14.transaction.domain.model.Transaction;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class DsTransactionServiceAdapter implements AiServicePort {

    private final RestTemplate restTemplate;

    @Value("${ds.service.url:http://127.0.0.1:8000}")
    private String dsServiceUrl;

    @Override
    public Transaction classifyTransaction(Transaction transaction) {

        String url = dsServiceUrl
                + "/api/v1/transactions/"
                + transaction.getId()
                + "/classify/";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<DsTransactionClassificationResponse> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        DsTransactionClassificationResponse.class
                );

        DsTransactionClassificationResponse body = response.getBody();

        if (body == null) {
            throw new IllegalStateException(
                    "El servicio de Data Science no devolvió una respuesta"
            );
        }

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
                .status(transaction.getStatus())

                .movementType(body.movementType())
                .modelCategory(body.modelCategory())
                .modelPurpose(body.modelPurpose())

                .modelCategoryConfidencePercentage(
                        body.modelCategoryConfidencePercentage() != null
                                ? BigDecimal.valueOf(
                                body.modelCategoryConfidencePercentage()
                        )
                                : null
                )

                .modelPurposeConfidencePercentage(
                        body.modelPurposeConfidencePercentage() != null
                                ? BigDecimal.valueOf(
                                body.modelPurposeConfidencePercentage()
                        )
                                : null
                )

                .modelRegularity(body.modelRegularity())

                .modelRegularityConfidencePercentage(
                        body.modelRegularityConfidencePercentage() != null
                                ? BigDecimal.valueOf(
                                body.modelRegularityConfidencePercentage()
                        )
                                : null
                )

                .modelRequiresConfirmation(
                        body.modelRequiresConfirmation()
                )

                .modelConfirmationProbabilityPercentage(
                        body.modelConfirmationProbabilityPercentage() != null
                                ? BigDecimal.valueOf(
                                body.modelConfirmationProbabilityPercentage()
                        )
                                : null
                )

                .build();
    }
}