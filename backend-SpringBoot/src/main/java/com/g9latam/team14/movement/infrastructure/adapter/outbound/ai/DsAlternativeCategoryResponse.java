package com.g9latam.team14.movement.infrastructure.adapter.outbound.ai;
import com.fasterxml.jackson.annotation.JsonProperty;
public record DsAlternativeCategoryResponse(
        @JsonProperty("category")
        String category,

        @JsonProperty("percentage")
        Double percentage
) {}
