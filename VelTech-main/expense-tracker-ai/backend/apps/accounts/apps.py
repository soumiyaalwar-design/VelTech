"""Apps configuration for accounts app."""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """Configuration class for accounts app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    verbose_name = 'User Accounts'
