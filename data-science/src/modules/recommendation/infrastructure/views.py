from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from modules.recommendation.application.generate_recommendation_service import GenerateRecommendationUseCase

class RecommendationController(APIView):
    """
    REST Endpoint for Models 3 & 4: Trajectory & Recommendation Engine.
    Exposes financial trajectory status and personalized recommendation.
    """
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.use_case = GenerateRecommendationUseCase()

    def get(self, request):
        try:
            payload = {
                'total_income': float(request.query_params.get('total_income', 3500000.0)),
                'total_expenses': float(request.query_params.get('total_expenses', 2100000.0)),
                'debt_payments': float(request.query_params.get('debt_payments', 500000.0)),
            }
            result = self.use_case.execute(payload)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as err:
            return Response({'detail': str(err)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            result = self.use_case.execute(request.data or {})
            return Response(result, status=status.HTTP_200_OK)
        except Exception as err:
            return Response({'detail': str(err)}, status=status.HTTP_400_BAD_REQUEST)
