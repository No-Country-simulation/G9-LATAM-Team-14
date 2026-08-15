from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from modules.transaction.application.classify_transaction_service import ClassifyTransactionUseCase

class TransactionClassificationController(APIView):
    """
    REST Endpoint for Model 2: Transaction Classification.
    Accepts movement input from Spring Boot and returns the ML classification.
    """
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.use_case = ClassifyTransactionUseCase()

    def post(self, request, transaction_id=None):
        try:
            payload = request.data or {}
            result = self.use_case.execute(payload)
            return Response(
                {
                    'message': 'Transaction classified successfully.',
                    'model_suggestion': result,
                    'status': 'awaiting_confirmation'
                },
                status=status.HTTP_200_OK
            )
        except Exception as err:
            return Response(
                {'detail': str(err)},
                status=status.HTTP_400_BAD_REQUEST
            )
