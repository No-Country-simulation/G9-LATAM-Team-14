from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from modules.profile.application.classify_profile_service import ClassifyProfileUseCase

class ProfileClassificationController(APIView):
    """
    REST Endpoint for Model 1: User Profile Classification.
    Accepts JSON input from Spring Boot and returns the ML prediction.
    """
    permission_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.use_case = ClassifyProfileUseCase()

    def post(self, request):
        try:
            result = self.use_case.execute(request.data)
            return Response(
                {
                    'message': 'Profile classified successfully.',
                    'classification': result
                },
                status=status.HTTP_200_OK
            )
        except Exception as err:
            return Response(
                {'detail': str(err)},
                status=status.HTTP_400_BAD_REQUEST
            )
