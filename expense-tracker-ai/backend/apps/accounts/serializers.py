"""Serializers for authentication endpoints."""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError

from apps.accounts.models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration (FR-01).
    
    Validates:
    - Email uniqueness
    - Email format
    - Password strength (8+ chars, uppercase, lowercase, digit)
    - Password confirmation match
    - Name validation
    - Mobile number format
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Password must be at least 8 characters with uppercase, lowercase, and digit.'
    )
    password_confirmation = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Must match password field.'
    )
    mobile_number = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Phone number: +country_code or 10 digits'
    )
    
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'mobile_number', 'password', 'password_confirmation']
        extra_kwargs = {
            'email': {
                'required': True,
                'help_text': 'Must be unique.'
            },
            'first_name': {
                'required': True,
                'min_length': 1,
                'max_length': 100,
            },
            'last_name': {
                'required': False,
                'allow_blank': True,
            },
        }
    
    def validate_email(self, value):
        """Validate email uniqueness."""
        if CustomUser.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('Email already registered. Please use login or reset password.')
        return value.lower()
    
    def validate_first_name(self, value):
        """Validate first name."""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError('First name cannot be empty.')
        if len(value) < 2:
            raise serializers.ValidationError('First name must be at least 2 characters.')
        return value.strip()
    
    def validate_last_name(self, value):
        """Validate last name."""
        if value and len(value.strip()) > 0:
            if len(value) < 2:
                raise serializers.ValidationError('Last name must be at least 2 characters.')
            return value.strip()
        return value
    
    def validate_password(self, value):
        """Validate password strength."""
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        
        has_upper = any(c.isupper() for c in value)
        has_lower = any(c.islower() for c in value)
        has_digit = any(c.isdigit() for c in value)
        
        if not (has_upper and has_lower and has_digit):
            raise serializers.ValidationError(
                'Password must contain at least one uppercase letter, one lowercase letter, and one digit.'
            )
        
        try:
            validate_password(value)
        except (serializers.ValidationError, DjangoValidationError) as e:
            msg = list(e.messages) if hasattr(e, 'messages') else [str(e)]
            raise serializers.ValidationError(msg)
        
        return value
    
    def validate_mobile_number(self, value):
        """Validate mobile number format."""
        if value and len(value.strip()) > 0:
            # Simple validation: should be digits or start with +
            cleaned = value.replace(' ', '').replace('-', '')
            if not (cleaned.isdigit() or (cleaned.startswith('+') and cleaned[1:].replace('+', '').isdigit())):
                raise serializers.ValidationError('Mobile number must contain only digits, spaces, or dashes.')
            return cleaned
        return value
    
    def validate(self, data):
        """Validate password confirmation matches."""
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')
        
        if password != password_confirmation:
            raise serializers.ValidationError({
                'password_confirmation': 'Password and password confirmation must match.'
            })
        
        # Remove confirmation field (not part of model)
        data.pop('password_confirmation')
        
        return data
    
    def create(self, validated_data):
        """Create user with hashed password."""
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            mobile_number=validated_data.get('mobile_number', ''),
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login (FR-02).
    
    Validates:
    - Email exists
    - Password is correct
    - User is active
    """
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """Validate credentials."""
        email = data.get('email', '').lower()
        password = data.get('password')
        
        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')
        
        # Try to authenticate
        user = authenticate(username=email, password=password)
        if not user:
            user = authenticate(email=email, password=password)
        if not user:
            try:
                candidate = CustomUser.objects.get(email__iexact=email)
                if candidate.check_password(password):
                    user = candidate
            except CustomUser.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is inactive.')
        
        # Store user for later use
        data['user'] = user
        return data


class CustomUserTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer for JWT token pair with user data.
    Extends simplejwt's TokenObtainPairSerializer to include user info in response.
    """
    
    def get_token(self, user):
        """Add custom claims to token."""
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name or ''
        return token
    
    @classmethod
    def get_token(cls, user):
        """Get token with custom claims."""
        token = super().get_token(user)
        token['email'] = user.email
        token['first_name'] = user.first_name
        return token


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile retrieval and updates."""
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'mobile_number', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'is_active', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        """Update user profile."""
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.mobile_number = validated_data.get('mobile_number', instance.mobile_number)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirmation = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value
    
    def validate_new_password(self, value):
        """Validate new password strength."""
        if len(value) < 8:
            raise serializers.ValidationError('New password must be at least 8 characters long.')
        
        has_upper = any(c.isupper() for c in value)
        has_lower = any(c.islower() for c in value)
        has_digit = any(c.isdigit() for c in value)
        
        if not (has_upper and has_lower and has_digit):
            raise serializers.ValidationError(
                'New password must contain at least one uppercase letter, one lowercase letter, and one digit.'
            )
        
        try:
            validate_password(value)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.detail)
        
        return value
    
    def validate(self, data):
        """Validate password confirmation."""
        if data['new_password'] != data['password_confirmation']:
            raise serializers.ValidationError({
                'password_confirmation': 'Passwords do not match.'
            })
        return data
    
    def save(self):
        """Save new password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
