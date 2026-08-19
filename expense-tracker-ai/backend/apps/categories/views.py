"""Views for Category API."""

from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.response import Response

from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from core.exceptions import StandardResponse


class CategoryListCreateView(generics.ListCreateAPIView):
    """
    List categories and create custom category.
    
    GET /api/categories/
    Optional query params:
    - type: EXPENSE or INCOME
    - include_inactive: true / false
    """
    
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Category.objects.filter(
            Q(user=user) | Q(user__isnull=True)
        )
        
        # Filter by active status
        include_inactive = self.request.query_params.get('include_inactive', 'false').lower() == 'true'
        if not include_inactive:
            queryset = queryset.filter(is_active=True)

        # Filter by type
        cat_type = self.request.query_params.get('type')
        if cat_type and cat_type.upper() in ['EXPENSE', 'INCOME']:
            queryset = queryset.filter(type=cat_type.upper())

        return queryset.order_by('is_default', 'name')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return StandardResponse.success(
            data=serializer.data,
            message="Categories retrieved successfully."
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return StandardResponse.success(
            data=CategorySerializer(category, context={'request': request}).data,
            message="Category created successfully.",
            status_code=status.HTTP_201_CREATED
        )


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a category.
    
    GET /api/categories/{id}/
    PUT / PATCH /api/categories/{id}/
    DELETE /api/categories/{id}/
    """
    
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Category.objects.filter(Q(user=user) | Q(user__isnull=True))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return StandardResponse.success(
            data=serializer.data,
            message="Category retrieved successfully."
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Prevent editing default system categories
        if instance.is_default or instance.user is None:
            return StandardResponse.error(
                message="System default categories cannot be modified.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # Prevent editing someone else's category
        if instance.user != request.user:
            return StandardResponse.error(
                message="You do not have permission to modify this category.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_category = serializer.save()

        return StandardResponse.success(
            data=CategorySerializer(updated_category, context={'request': request}).data,
            message="Category updated successfully."
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Prevent deleting default system categories
        if instance.is_default or instance.user is None:
            return StandardResponse.error(
                message="System default categories cannot be deleted.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        if instance.user != request.user:
            return StandardResponse.error(
                message="You do not have permission to delete this category.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # Check if used in expenses, income, or budgets
        if instance.expenses.filter(is_deleted=False).exists() or instance.incomes.filter(is_deleted=False).exists() or instance.budgets.exists():
            # Soft deactivate
            instance.is_active = False
            instance.save()
            return StandardResponse.success(
                data=None,
                message="Category is attached to active transactions/budgets and was deactivated.",
                status_code=status.HTTP_200_OK
            )

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
