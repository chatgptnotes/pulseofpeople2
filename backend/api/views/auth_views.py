"""
Custom authentication views for flexible login (username or email)
"""

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers


class FlexibleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that accepts either username or email for login
    """
    username_field = 'username'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make the field accept both username and email
        self.fields[self.username_field] = serializers.CharField()
        self.fields['password'] = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Validate and authenticate user with username or email
        """
        username_or_email = attrs.get(self.username_field)
        password = attrs.get('password')

        # Try to find user by username first
        user = None
        try:
            if '@' in username_or_email:
                # If it contains @, treat it as email
                user = User.objects.get(email=username_or_email)
                username = user.username
            else:
                # Otherwise treat it as username
                user = User.objects.get(username=username_or_email)
                username = username_or_email
        except User.DoesNotExist:
            # If not found, still try to authenticate (Django will handle the error)
            username = username_or_email

        # Authenticate with username
        credentials = {
            'username': username,
            'password': password
        }

        # Use Django's authenticate method
        user = authenticate(**credentials)

        if user is None:
            raise serializers.ValidationError(
                'No active account found with the given credentials'
            )

        if not user.is_active:
            raise serializers.ValidationError(
                'User account is disabled'
            )

        # Generate tokens using the parent class
        refresh = self.get_token(user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return data


class FlexibleTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses FlexibleTokenObtainPairSerializer
    """
    serializer_class = FlexibleTokenObtainPairSerializer
