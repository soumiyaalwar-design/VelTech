"""Views for Budget API."""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response

from apps.budgets.models import Budget
from apps.budgets.serializers import BudgetSerializer
from core.exceptions import StandardResponse


class BudgetListCreateView(generics.ListCreateAPIView):
    """
    List budgets and create a new budget.
    
    GET /api/budgets/
    Query parameters:
    - month: 1-12
    - year: e.g. 2026
    - category: category id
    """
    
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['year', 'month', 'amount']
    ordering = ['-year', '-month']

    def get_queryset(self):
        user = self.request.user
        queryset = Budget.objects.filter(user=user).select_related('category')

        month = self.request.query_params.get('month')
        if month:
            queryset = queryset.filter(month=month)

        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(year=year)

        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return StandardResponse.success(
            data=serializer.data,
            message="Budgets retrieved successfully."
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        budget = serializer.save()
        return StandardResponse.success(
            data=BudgetSerializer(budget, context={'request': request}).data,
            message="Budget created successfully.",
            status_code=status.HTTP_201_CREATED
        )


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a single budget.
    
    GET /api/budgets/{id}/
    PUT / PATCH /api/budgets/{id}/
    DELETE /api/budgets/{id}/
    """
    
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).select_related('category')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return StandardResponse.success(
            data=serializer.data,
            message="Budget retrieved successfully."
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_budget = serializer.save()

        return StandardResponse.success(
            data=BudgetSerializer(updated_budget, context={'request': request}).data,
            message="Budget updated successfully."
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
