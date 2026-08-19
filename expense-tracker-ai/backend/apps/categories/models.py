"""Category model for Expense Tracker System."""

from django.db import models
from django.conf import settings


class Category(models.Model):
    """
    Category model for Income and Expense transactions.
    
    Supports:
    - Default system categories (user=None, is_default=True)
    - Custom user-created categories (user=request.user, is_default=False)
    """
    
    CATEGORY_TYPE_CHOICES = [
        ('EXPENSE', 'Expense'),
        ('INCOME', 'Income'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='categories',
        db_index=True,
        help_text='Null user indicates a system-wide default category.'
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CATEGORY_TYPE_CHOICES, db_index=True)
    icon = models.CharField(max_length=100, default='Tag', blank=True)
    color = models.CharField(max_length=20, default='#6366F1', blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'name', 'type'],
                name='unique_user_category_name_type'
            )
        ]
        indexes = [
            models.Index(fields=['user', 'type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        owner = "Default" if self.is_default or not self.user else self.user.email
        return f"{self.name} ({self.type} - {owner})"
