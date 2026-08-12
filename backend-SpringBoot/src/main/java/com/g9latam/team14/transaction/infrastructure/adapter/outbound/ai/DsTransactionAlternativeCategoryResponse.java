package com.g9latam.team14.transaction.infrastructure.adapter.outbound.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DsTransactionAlternativeCategoryResponse(

        @JsonProperty("category")
        String category,

        @JsonProperty("percentage")
        Double percentage

) {
}