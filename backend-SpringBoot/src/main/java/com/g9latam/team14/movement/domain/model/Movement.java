package com.g9latam.team14.movement.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class Movement {
    private final Integer id;
    private final String description;
    private final BigDecimal amount;
    private final String type;
    private final String category;
    private final LocalDate date;
    private final Integer userId;

}