"""Custom User model for Expense Tracker System."""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.validators import EmailValidator, RegexValidator
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password, first_name='', last_name='', mobile_number='', **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError('Email is required.')
        
        email = self.normalize_email(email).lower()
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            mobile_number=mobile_number,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, first_name='Admin', last_name='User', **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, first_name, last_name, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model with email-based authentication.
    
    Maps to SRS schema:
    - id: BIGINT AUTO_INCREMENT (PK)
    - email: VARCHAR(255) UNIQUE
    - password_hash: VARCHAR(255) (handled by AbstractBaseUser as 'password')
    - first_name: VARCHAR(100)
    - last_name: VARCHAR(100)
    - mobile_number: VARCHAR(20)
    - is_active: TINYINT(1) default 1
    - is_staff: TINYINT(1) default 0
    - is_superuser: TINYINT(1) default 0
    - created_at: DATETIME auto_now_add
    - updated_at: DATETIME auto_now
    """
    
    EMAIL_VALIDATOR = EmailValidator(message='Enter a valid email address.')
    MOBILE_REGEX = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Mobile number must be between 9 and 15 digits.'
    )
    
    id = models.BigAutoField(primary_key=True)
    email = models.EmailField(
        unique=True,
        max_length=255,
        validators=[EMAIL_VALIDATOR],
        db_index=True,
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    mobile_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[MOBILE_REGEX],
        help_text='Phone number in format: +country_code or 10 digits'
    )
    profile_image = models.CharField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f'{self.get_full_name()} ({self.email})'
    
    def get_full_name(self):
        """Return the user's full name."""
        full_name = f'{self.first_name}'.strip()
        if self.last_name:
            full_name = f'{full_name} {self.last_name}'.strip()
        return full_name
    
    def get_short_name(self):
        """Return the user's short name."""
        return self.first_name
    
    def clean(self):
        """Validate user model."""
        super().clean()
        self.email = self.email.lower()
        if not self.first_name:
            raise ValueError('First name is required.')
