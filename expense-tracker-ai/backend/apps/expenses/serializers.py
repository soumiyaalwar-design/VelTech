"""Serializers for Expense API."""

from decimal import Decimal
from rest_framework import serializers
from apps.expenses.models import Expense
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model."""
    
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Expense
        fields = [
            'id',
            'category',
            'category_id',
            'amount',
            'date',
            'payment_method',
            'description',
            'notes',
            'is_deleted',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_deleted', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_category_id(self, category):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        # Verify category is EXPENSE
        if category.type != 'EXPENSE':
            raise serializers.ValidationError("Selected category must be an 'EXPENSE' category.")

        # Verify category is active
        if not category.is_active:
            raise serializers.ValidationError("Selected category is inactive.")

        # Verify user has access (default or owned)
        if not category.is_default and category.user != user:
            raise serializers.ValidationError("You do not have access to this category.")

        return category

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
