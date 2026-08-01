package com.g9latam.team14.recommendation.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class Recommendation {
    private final Integer id;
    private final Integer userId;
    private final Prioridad priority;
    private final String title;
    private final String description;
    private final String insight;
    private final String actionLabel;
    private final int impactPoints;
    private final boolean completed;
    private final LocalDate date;
}
