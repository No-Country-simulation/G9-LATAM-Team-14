package com.g9latam.team14.movement.domain.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AiAlternativeCategory {
    private final String category;
    private final Double percentage;
}
