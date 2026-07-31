package com.g9latam.team14.recommendation.domain.service;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;
import com.g9latam.team14.recommendation.domain.model.Recommendation;

import java.util.List;

/**
 * Servicio de dominio puro (sin Spring/JPA).
 * Calcula el score financiero a partir de un score base y el impacto de las recomendaciones:
 * - currentScore   = base + suma del impacto de las recomendaciones YA completadas.
 * - potentialScore = base + suma del impacto de TODAS las recomendaciones.
 * Ambos se acotan al rango [0, 100].
 */
public class ScoreCalculator {

    private static final int MIN_SCORE = 0;
    private static final int MAX_SCORE = 100;

    public FinancialScore calculate(int baseScore, List<Recommendation> recommendations) {
        int completedImpact = recommendations.stream()
                .filter(Recommendation::isCompleted)
                .mapToInt(Recommendation::getImpactPoints)
                .sum();

        int totalImpact = recommendations.stream()
                .mapToInt(Recommendation::getImpactPoints)
                .sum();

        int completedActions = (int) recommendations.stream()
                .filter(Recommendation::isCompleted)
                .count();

        return FinancialScore.builder()
                .currentScore(clamp(baseScore + completedImpact))
                .potentialScore(clamp(baseScore + totalImpact))
                .completedActions(completedActions)
                .totalActions(recommendations.size())
                .build();
    }

    private int clamp(int value) {
        return Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
    }
}
