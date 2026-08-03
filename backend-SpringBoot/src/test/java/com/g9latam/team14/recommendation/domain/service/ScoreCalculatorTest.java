package com.g9latam.team14.recommendation.domain.service;

import com.g9latam.team14.recommendation.domain.model.FinancialScore;
import com.g9latam.team14.recommendation.domain.model.Prioridad;
import com.g9latam.team14.recommendation.domain.model.Recommendation;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoreCalculatorTest {

    private final ScoreCalculator calculator = new ScoreCalculator();

    private Recommendation rec(int impact, boolean completed) {
        return Recommendation.builder()
                .id(1)
                .userId(1)
                .priority(Prioridad.ALTA)
                .title("t")
                .description("d")
                .insight("i")
                .actionLabel("a")
                .impactPoints(impact)
                .completed(completed)
                .date(LocalDate.now())
                .build();
    }

    @Test
    void currentSumsCompletedImpact_potentialSumsAll() {
        List<Recommendation> recs = List.of(
                rec(8, true),
                rec(10, false),
                rec(5, false)
        );

        FinancialScore score = calculator.calculate(60, recs);

        assertEquals(68, score.getCurrentScore());   // 60 + 8 completadas
        assertEquals(83, score.getPotentialScore());  // 60 + 23 total
        assertEquals(1, score.getCompletedActions());
        assertEquals(3, score.getTotalActions());
    }

    @Test
    void scoresAreClampedTo100() {
        List<Recommendation> recs = List.of(
                rec(40, true),
                rec(40, true)
        );

        FinancialScore score = calculator.calculate(60, recs);

        assertEquals(100, score.getCurrentScore());
        assertEquals(100, score.getPotentialScore());
    }

    @Test
    void scoresAreClampedTo0() {
        FinancialScore score = calculator.calculate(-20, List.of());

        assertEquals(0, score.getCurrentScore());
        assertEquals(0, score.getPotentialScore());
        assertEquals(0, score.getTotalActions());
    }

    @Test
    void emptyRecommendations_scoreEqualsBase() {
        FinancialScore score = calculator.calculate(72, List.of());

        assertEquals(72, score.getCurrentScore());
        assertEquals(72, score.getPotentialScore());
    }
}
