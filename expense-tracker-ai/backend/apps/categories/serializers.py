"""Serializers for Category model."""

from rest_framework import serializers
from apps.categories.models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'type',
            'icon',
            'color',
            'description',
            'is_default',
            'is_active',
            'is_owner',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_default', 'created_at', 'updated_at', 'is_owner']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        name = data.get('name', getattr(self.instance, 'name', None))
        cat_type = data.get('type', getattr(self.instance, 'type', None))

        if name:
            name = name.strip()
            data['name'] = name

        # Check for duplicates for this user
        existing_query = Category.objects.filter(
            user=user,
            name__iexact=name,
            type=cat_type,
            is_active=True
        )
        if self.instance:
            existing_query = existing_query.exclude(pk=self.instance.pk)

        if existing_query.exists():
            raise serializers.ValidationError({
                'name': f"A {cat_type.lower()} category named '{name}' already exists."
            })

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['is_default'] = False
        return super().create(validated_data)
