"""Admin configuration for Income model."""

from django.contrib import admin
from apps.income.models import Income


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'amount', 'date', 'payment_method', 'is_deleted', 'created_at']
    list_filter = ['payment_method', 'is_deleted', 'date', 'category']
    search_fields = ['description', 'notes', 'user__email', 'category__name']
    ordering = ['-date', '-created_at']
