from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from movements.presentation.serializers import (
    MovementInputSerializer,
    MovementOutputSerializer,
)
from movements.application.classify_movement_use_case import ClassifyMovementUseCase

class MovementClassifyView(APIView):
    """
    Controlador de la capa de presentación DRF.
    Petición HTTP: POST /api/v1/movements/classify/
    """
    def post(self, request):
        serializer = MovementInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            result = ClassifyMovementUseCase.execute(
                description=data['description'],
                amount=data['amount'],
                direction=data.get('direction', 'salida'),
                note=data.get('note', '')
            )
            output_serializer = MovementOutputSerializer(result)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Error en la clasificación por IA: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
