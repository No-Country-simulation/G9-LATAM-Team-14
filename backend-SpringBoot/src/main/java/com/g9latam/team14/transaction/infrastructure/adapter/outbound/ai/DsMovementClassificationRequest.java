package com.g9latam.team14.transaction.infrastructure.adapter.outbound.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record DsMovementClassificationRequest(

        @JsonProperty("description")
        String description,

        @JsonProperty("amount")
        BigDecimal amount,

        @JsonProperty("direction")
        String direction,

        @JsonProperty("note")
        String note

) {
}