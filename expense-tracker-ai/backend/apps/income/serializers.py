"""Serializers for Income API."""

from decimal import Decimal
from rest_framework import serializers
from apps.income.models import Income
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer


class IncomeSerializer(serializers.ModelSerializer):
    """Serializer for Income model."""
    
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Income
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

        # Verify category is INCOME
        if category.type != 'INCOME':
            raise serializers.ValidationError("Selected category must be an 'INCOME' category.")

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
