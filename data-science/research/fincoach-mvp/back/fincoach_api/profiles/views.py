import logging

from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import APIException, NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from fincoach_api.openapi import (
    AUTHENTICATION_ERROR,
    CONFLICT_ERROR,
    MODEL_UNAVAILABLE_ERROR,
    NOT_FOUND_ERROR,
    SECURITY_HEADER,
    VALIDATION_ERROR,
    object_response,
)

from .models import FinancialProfile
from .serializers import FinancialProfileInputSerializer, FinancialProfileSerializer
from .services import build_model_paragraph, classify_profile, evaluate_auxiliary_filter


logger = logging.getLogger(__name__)

INPUT_FIELDS = [
    'monthly_net_income',
    'saving_habit',
    'debt_ratio_percentage',
    'debt_types',
    'primary_activity',
    'primary_income_modality',
    'has_additional_income',
    'additional_activity',
    'additional_income_modality',
    'next_goal',
    'hobbies',
    'financial_responsibility',
]


class ProfileModelUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'The user profile model is temporarily unavailable.'
    default_code = 'profile_model_unavailable'


def get_profile_or_raise(user):
    try:
        return FinancialProfile.objects.get(user=user)
    except FinancialProfile.DoesNotExist as error:
        raise NotFound('The financial profile was not found.') from error


def merge_profile_data(profile, changes):
    return {
        field_name: changes.get(field_name, getattr(profile, field_name))
        for field_name in INPUT_FIELDS
    }


def execute_model(data):
    try:
        return classify_profile(data)
    except Exception as error:
        logger.exception('The user profile model could not be executed.')
        raise ProfileModelUnavailable() from error


def apply_profile_data(profile, data, result):
    for field_name in INPUT_FIELDS:
        setattr(profile, field_name, data[field_name])

    profile.model_paragraph = build_model_paragraph(data)
    profile.auxiliary_filter_status = evaluate_auxiliary_filter(data['saving_habit'])
    profile.mvp_scope_status = result['estado_alcance_mvp']
    profile.primary_activity_classification = result['actividad_principal']
    profile.cuoc_occupation = result['ocupacion_cuoc']
    profile.cuoc_code = result['codigo_cuoc']
    profile.activity_confidence_percentage = result['confianza_actividad_pct']
    profile.model_probability_percentage = result['probabilidad_modelo_pct']
    profile.catalog_similarity_percentage = result['similitud_catalogo_pct']
    profile.secondary_activity_classification = result['actividad_secundaria']
    profile.classified_hobbies = result['hobbies_intereses']
    profile.out_of_mvp_hobbies = result['hobbies_fuera_mvp']
    profile.classified_goal = result['meta']
    profile.classified_responsibility = result['responsabilidad']
    profile.debt_calculation_status = result['estado_calculo_endeudamiento']
    profile.top_3_activities = result['top_3_actividades']
    profile.model_version = result['version_modelo']
    profile.model_result = result


class FinancialProfileCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Profiles'],
        summary='Create the financial profile',
        description=(
            'Stores the declared financial context and classifies the user within '
            'the occupational and hobby scope of the MVP.'
        ),
        operation_id='profiles_create',
        parameters=[SECURITY_HEADER],
        request=FinancialProfileInputSerializer,
        responses={
            201: object_response(
                'The profile was created and classified.',
                'Created profile',
                {
                    'message': 'Financial profile created successfully.',
                    'profile': {
                        'id': 1,
                        'declared_data': {
                            'monthly_net_income': 3500000.0,
                            'saving_habit': 'media',
                            'debt_ratio_percentage': 20.0,
                            'primary_activity': 'Desarrollador de software',
                        },
                        'classification': {
                            'mvp_scope': 'dentro_del_mvp',
                            'primary_activity': 'ingenieria_y_desarrollo_de_software',
                            'confidence_percentage': 95.06,
                        },
                    },
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
            409: CONFLICT_ERROR,
            503: MODEL_UNAVAILABLE_ERROR,
        },
    )
    def post(self, request):
        if FinancialProfile.objects.filter(user=request.user).exists():
            return Response(
                {'detail': 'The financial profile already exists. Use PATCH to update it.'},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = FinancialProfileInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        result = execute_model(data)

        with transaction.atomic():
            profile = FinancialProfile(user=request.user)
            apply_profile_data(profile, data, result)
            profile.save()

        return Response(
            {
                'message': 'Financial profile created successfully.',
                'profile': FinancialProfileSerializer(profile).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MyFinancialProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Profiles'],
        summary='Get the financial profile',
        description='Returns declared data and the current user classification.',
        operation_id='profiles_me_get',
        responses={
            200: object_response(
                'The authenticated user financial profile.',
                'Financial profile',
                {
                    'profile': {
                        'id': 1,
                        'declared_data': {
                            'monthly_net_income': 3500000.0,
                            'saving_habit': 'media',
                            'debt_ratio_percentage': 20.0,
                        },
                        'classification': {
                            'mvp_scope': 'dentro_del_mvp',
                            'primary_activity': 'ingenieria_y_desarrollo_de_software',
                            'confidence_percentage': 95.06,
                        },
                    },
                },
            ),
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
        },
    )
    def get(self, request):
        profile = get_profile_or_raise(request.user)
        return Response(
            {'profile': FinancialProfileSerializer(profile).data},
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        tags=['Profiles'],
        summary='Update the financial profile',
        description=(
            'Partially updates declared fields and recalculates the user '
            'classification.'
        ),
        operation_id='profiles_me_update',
        parameters=[SECURITY_HEADER],
        request=FinancialProfileInputSerializer,
        responses={
            200: object_response(
                'The profile was updated and reclassified.',
                'Updated profile',
                {
                    'message': 'Financial profile updated successfully.',
                    'profile': {
                        'id': 1,
                        'declared_data': {
                            'saving_habit': 'media',
                            'next_goal': 'comprar equipo de trabajo',
                        },
                        'classification': {
                            'mvp_scope': 'dentro_del_mvp',
                        },
                    },
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
            503: MODEL_UNAVAILABLE_ERROR,
        },
    )
    def patch(self, request):
        profile = get_profile_or_raise(request.user)
        serializer = FinancialProfileInputSerializer(
            instance=profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        data = merge_profile_data(profile, serializer.validated_data)
        result = execute_model(data)

        with transaction.atomic():
            apply_profile_data(profile, data, result)
            profile.save()

        return Response(
            {
                'message': 'Financial profile updated successfully.',
                'profile': FinancialProfileSerializer(profile).data,
            },
            status=status.HTTP_200_OK,
        )
