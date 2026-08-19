"""Admin configuration for Expense model."""

from django.contrib import admin
from apps.expenses.models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'amount', 'date', 'payment_method', 'is_deleted', 'created_at']
    list_filter = ['payment_method', 'is_deleted', 'date', 'category']
    search_fields = ['description', 'notes', 'user__email', 'category__name']
    ordering = ['-date', '-created_at']
