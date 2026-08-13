package com.g9latam.team14.transaction.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
public class CategoryPercentage {

    private String category;
    private BigDecimal percentage;

    @JsonCreator
    public CategoryPercentage(
            @JsonProperty("category") String category,
            @JsonProperty("percentage") BigDecimal percentage
    ) {
        this.category = category;
        this.percentage = percentage;
    }
}