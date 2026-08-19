"""Serializers for Budget API."""

from decimal import Decimal
from django.db.models import Sum
from rest_framework import serializers
from apps.budgets.models import Budget
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.expenses.models import Expense


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget model with real-time calculated fields."""
    
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    actual_expense = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    usage_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_id',
            'amount',
            'month',
            'year',
            'alert_percentage',
            'actual_expense',
            'remaining_amount',
            'usage_percentage',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'actual_expense', 'remaining_amount', 'usage_percentage', 'status']

    def get_actual_expense(self, obj):
        # Calculate sum of expenses for this user, category, month, and year
        expense_sum = Expense.objects.filter(
            user_id=obj.user_id,
            category_id=obj.category_id,
            date__year=obj.year,
            date__month=obj.month,
            is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return f"{Decimal(expense_sum):.2f}"

    def get_remaining_amount(self, obj):
        actual = Decimal(self.get_actual_expense(obj))
        remaining = obj.amount - actual
        return f"{Decimal(remaining):.2f}"

    def get_usage_percentage(self, obj):
        actual = Decimal(self.get_actual_expense(obj))
        if obj.amount > Decimal('0.00'):
            percentage = (actual / obj.amount) * Decimal('100.00')
            return round(float(percentage), 2)
        return 0.0

    def get_status(self, obj):
        usage = self.get_usage_percentage(obj)
        alert_pct = float(obj.alert_percentage)
        
        if usage > 100.0:
            return 'EXCEEDED'
        elif usage >= alert_pct:
            return 'WARNING'
        elif usage >= 70.0:
            return 'NEAR_LIMIT'
        else:
            return 'HEALTHY'

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError('Budget amount must be greater than zero.')
        return value

    def validate_month(self, value):
        if not (1 <= value <= 12):
            raise serializers.ValidationError('Month must be between 1 and 12.')
        return value

    def validate_category_id(self, category):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        # Verify category is EXPENSE
        if category.type != 'EXPENSE':
            raise serializers.ValidationError("Budgets can only be set for 'EXPENSE' categories.")

        # Verify active
        if not category.is_active:
            raise serializers.ValidationError("Selected category is inactive.")

        # Verify user has access
        if not category.is_default and category.user != user:
            raise serializers.ValidationError("You do not have access to this category.")

        return category

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        
        category = data.get('category', getattr(self.instance, 'category', None))
        month = data.get('month', getattr(self.instance, 'month', None))
        year = data.get('year', getattr(self.instance, 'year', None))

        # Check duplicate budget for same user, category, month, and year
        existing_query = Budget.objects.filter(
            user=user,
            category=category,
            month=month,
            year=year
        )
        if self.instance:
            existing_query = existing_query.exclude(pk=self.instance.pk)

        if existing_query.exists():
            raise serializers.ValidationError(
                f"A budget for '{category.name}' for {month}/{year} already exists."
            )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
