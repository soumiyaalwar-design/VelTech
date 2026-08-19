"""Budget model for Expense Tracker System."""

from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.categories.models import Category


class Budget(models.Model):
    """
    Budget model per Category and Month/Year.
    
    Enforces uniqueness per (user, category, month, year).
    """
    
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets',
        db_index=True
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='budgets',
        db_index=True
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'), message='Budget amount must be greater than 0.')]
    )
    month = models.IntegerField(
        validators=[
            MinValueValidator(1, message='Month must be between 1 and 12.'),
            MaxValueValidator(12, message='Month must be between 1 and 12.')
        ]
    )
    year = models.IntegerField(
        validators=[
            MinValueValidator(2000, message='Year must be valid.'),
            MaxValueValidator(2100, message='Year must be valid.')
        ]
    )
    alert_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('80.00'),
        validators=[MinValueValidator(Decimal('1.00')), MaxValueValidator(Decimal('100.00'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'budgets'
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
        ordering = ['-year', '-month', 'category__name']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'category', 'month', 'year'],
                name='unique_user_category_month_year_budget'
            )
        ]
        indexes = [
            models.Index(fields=['user', 'year', 'month']),
            models.Index(fields=['user', 'category']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.category.name}: ₹{self.amount} ({self.month}/{self.year})"
