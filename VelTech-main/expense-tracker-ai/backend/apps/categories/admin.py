"""Admin configuration for Category model."""

from django.contrib import admin
from apps.categories.models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'is_default', 'is_active', 'user', 'created_at']
    list_filter = ['type', 'is_default', 'is_active']
    search_fields = ['name', 'description', 'user__email']
    ordering = ['name']
