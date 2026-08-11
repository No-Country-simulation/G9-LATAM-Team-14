from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse
from rest_framework import serializers


class EmptyRequestSerializer(serializers.Serializer):
    pass


SECURITY_HEADER = OpenApiParameter(
    name='X-FinCoach-Request',
    type=OpenApiTypes.STR,
    location=OpenApiParameter.HEADER,
    required=True,
    enum=['1'],
    default='1',
    description=(
        'Required for POST, PUT, PATCH and DELETE requests. '
        'It complements the HTTP-only session cookie protection.'
    ),
)


def object_response(description, example_name=None, value=None):
    examples = []
    if example_name and value is not None:
        examples.append(
            OpenApiExample(
                example_name,
                value=value,
                response_only=True,
            )
        )
    return OpenApiResponse(
        response=OpenApiTypes.OBJECT,
        description=description,
        examples=examples,
    )


VALIDATION_ERROR = object_response(
    'The submitted data is invalid.',
    'Validation error',
    {'field_name': ['Explain why the value is invalid.']},
)
AUTHENTICATION_ERROR = object_response(
    'A valid FinCoach session is required.',
    'Authentication error',
    {'detail': 'The authentication credentials were not found.'},
)
NOT_FOUND_ERROR = object_response(
    'The requested resource was not found.',
    'Not found',
    {'detail': 'The requested resource was not found.'},
)
CONFLICT_ERROR = object_response(
    'The request conflicts with the current resource state.',
    'Conflict',
    {'detail': 'The operation cannot be completed in the current state.'},
)
MODEL_UNAVAILABLE_ERROR = object_response(
    'A required prediction model could not be executed.',
    'Model unavailable',
    {'detail': 'The required model is temporarily unavailable.'},
)
