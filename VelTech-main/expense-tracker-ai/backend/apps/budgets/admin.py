"""Admin configuration for Budget model."""

from django.contrib import admin
from apps.budgets.models import Budget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'amount', 'month', 'year', 'alert_percentage', 'created_at']
    list_filter = ['year', 'month', 'category']
    search_fields = ['user__email', 'category__name']
    ordering = ['-year', '-month']
