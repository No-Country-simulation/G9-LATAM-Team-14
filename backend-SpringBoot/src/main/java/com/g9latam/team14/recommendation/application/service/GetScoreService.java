package com.g9latam.team14.recommendation.application.service;

import com.g9latam.team14.dashboard.domain.model.DashboardSummary;
import com.g9latam.team14.dashboard.domain.ports.inbound.GetDashboardSummaryUseCase;
import com.g9latam.team14.recommendation.domain.model.FinancialScore;
import com.g9latam.team14.recommendation.domain.model.Recommendation;
import com.g9latam.team14.recommendation.domain.ports.inbound.GetRecommendationsUseCase;
import com.g9latam.team14.recommendation.domain.ports.inbound.GetScoreUseCase;
import com.g9latam.team14.recommendation.domain.service.ScoreCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GetScoreService implements GetScoreUseCase {

    private static final int SCORE_BASE_NEUTRO = 50;

    private final GetRecommendationsUseCase getRecommendationsUseCase;
    private final GetDashboardSummaryUseCase getDashboardSummaryUseCase;
    private final ScoreCalculator scoreCalculator = new ScoreCalculator();

    @Override
    public FinancialScore getScore(Integer userId) {
        List<Recommendation> recommendations = getRecommendationsUseCase.getForCurrentMonth(userId);
        int baseScore = calcularScoreBase(userId);
        return scoreCalculator.calculate(baseScore, recommendations);
    }

    /**
     * Score base provisional (pendiente del modelo ML de perfil financiero).
     * Parte de 60 puntos, premia el ratio de ahorro y penaliza el endeudamiento por encima del 35%.
     */
    private int calcularScoreBase(Integer userId) {
        DashboardSummary summary = getDashboardSummaryUseCase.getSummary(userId);

        BigDecimal ingresos = summary.getTotalIngresos();
        if (ingresos == null || ingresos.compareTo(BigDecimal.ZERO) == 0) {
            return SCORE_BASE_NEUTRO;
        }

        BigDecimal ahorroPct = summary.getBalanceNeto()
                .multiply(BigDecimal.valueOf(100))
                .divide(ingresos, 2, RoundingMode.HALF_UP);

        BigDecimal endeudamientoPct = summary.getTotalGastosFijos()
                .multiply(BigDecimal.valueOf(100))
                .divide(ingresos, 2, RoundingMode.HALF_UP);

        double excesoEndeudamiento = Math.max(0, endeudamientoPct.doubleValue() - 35);
        double base = 60 + ahorroPct.doubleValue() * 0.4 - excesoEndeudamiento * 0.6;

        int redondeado = (int) Math.round(base);
        return Math.max(0, Math.min(100, redondeado));
    }
}
