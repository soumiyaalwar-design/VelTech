"""Views for authentication endpoints."""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate

from apps.accounts.models import CustomUser
from apps.accounts.serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    CustomUserTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
)
from core.exceptions import StandardResponse


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint (FR-01).
    
    POST /api/v1/auth/register/
    {
        "email": "user@example.com",
        "password": "StrongPass123",
        "password_confirmation": "StrongPass123",
        "first_name": "John",
        "last_name": "Doe",
        "mobile_number": "+919876543210"
    }
    """
    
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Create user and return response."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return StandardResponse.success(
            data={
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'mobile_number': user.mobile_number,
            },
            message='Account created successfully. Please log in.',
            status_code=status.HTTP_201_CREATED
        )


class LoginView(generics.GenericAPIView):
    """
    User login endpoint (FR-02).
    
    POST /api/v1/auth/login/
    {
        "email": "user@example.com",
        "password": "StrongPass123"
    }
    
    Returns JWT access and refresh tokens.
    """
    
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Authenticate user and return tokens."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh.payload['email'] = user.email
        refresh.payload['first_name'] = user.first_name
        
        return StandardResponse.success(
            data={
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            },
            message='Login successful',
            status_code=status.HTTP_200_OK
        )


class TokenRefreshView(TokenRefreshView):
    """
    Token refresh endpoint.
    
    POST /api/v1/auth/token/refresh/
    {
        "refresh": "<refresh_token>"
    }
    
    Returns new access token.
    """
    
    def post(self, request, *args, **kwargs):
        """Refresh access token."""
        try:
            response = super().post(request, *args, **kwargs)
            return StandardResponse.success(
                data={'access': response.data['access']},
                message='Token refreshed successfully',
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return StandardResponse.error(
                message=str(e),
                status_code=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(generics.GenericAPIView):
    """
    User logout endpoint.
    
    POST /api/v1/auth/logout/
    {
        "refresh": "<refresh_token>"
    }
    
    Invalidates refresh token (can be extended for blacklisting).
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """Logout user by invalidating token."""
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return StandardResponse.error(
                message='Refresh token is required',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            # Token blacklisting failed or not configured, but logout still succeeds
            pass
        
        return Response(
            {
                'success': True,
                'message': 'Logout successful',
                'data': None,
                'errors': None,
            },
            status=status.HTTP_204_NO_CONTENT
        )


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user profile.
    
    GET /api/v1/auth/me/
    PATCH /api/v1/auth/me/
    """
    
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Return current user."""
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        """Get current user profile."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return StandardResponse.success(
            data=serializer.data,
            message='User profile retrieved',
            status_code=status.HTTP_200_OK
        )
    
    def update(self, request, *args, **kwargs):
        """Update current user profile."""
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return StandardResponse.success(
            data=UserProfileSerializer(user).data,
            message='Profile updated successfully',
            status_code=status.HTTP_200_OK
        )


class ChangePasswordView(generics.GenericAPIView):
    """
    Change user password.
    
    POST /api/v1/auth/change-password/
    {
        "old_password": "CurrentPass123",
        "new_password": "NewPass456",
        "password_confirmation": "NewPass456"
    }
    """
    
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """Change user password."""
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return StandardResponse.success(
            data=None,
            message='Password changed successfully',
            status_code=status.HTTP_200_OK
        )
