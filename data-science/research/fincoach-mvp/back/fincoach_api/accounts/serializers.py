from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class RegisterUserSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    accepts_data_processing = serializers.BooleanField(source='acepta_tratamiento_datos')

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'password',
            'accepts_data_processing',
        ]

    def validate_accepts_data_processing(self, value):
        if not value:
            raise serializers.ValidationError('You must accept the data processing policy.')
        return value

    def validate_email(self, value):
        email = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

    def validate(self, attributes):
        user = User(
            email=attributes.get('email'),
            first_name=attributes.get('first_name'),
            last_name=attributes.get('last_name'),
        )
        validate_password(attributes.get('password'), user)
        return attributes

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['fecha_aceptacion_datos'] = timezone.now()
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attributes):
        email = User.objects.normalize_email(attributes['email'])
        user = User.objects.filter(email__iexact=email).first()
        valid_credentials = (
            user is not None
            and user.is_active
            and user.check_password(attributes['password'])
        )
        if not valid_credentials:
            raise serializers.ValidationError('The credentials are incorrect.')
        attributes['user'] = user
        return attributes
