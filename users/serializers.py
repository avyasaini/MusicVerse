# users/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'bio', 'avatar', 'is_moderator', 'is_staff')

class CustomUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 're_password', 'bio', 'avatar')
        extra_kwargs = {
            'password': {'write_only': True},
            're_password': {'write_only': True},
        }

    def validate(self, data):
        if data['password'] != data['re_password']:
            raise serializers.ValidationError({'re_password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('re_password')  # Remove re_password before creating
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            bio=validated_data.get('bio', ''),  # Ensure bio is handled even if not provided
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.CharField(required=True)
        self.fields.pop('username')  # Remove username field

    def validate(self, attrs):
        # Map email to username for authentication
        attrs['username'] = attrs['email']
        return super().validate(attrs)

    def get_token(self, user):
        token = super().get_token(user)
        return token