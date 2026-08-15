from modules.recommendation.domain.recommendation_engine import evaluate_recommendation_domain

class GenerateRecommendationUseCase:
    """Use case for generating trajectory states and personalized recommendations."""
    
    def execute(self, payload: dict) -> dict:
        return evaluate_recommendation_domain(payload or {})
