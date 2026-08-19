"""Views for Expense API."""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response

from apps.expenses.models import Expense
from apps.expenses.serializers import ExpenseSerializer
from core.exceptions import StandardResponse


class ExpenseListCreateView(generics.ListCreateAPIView):
    """
    List expenses (paginated, filtered) and create a new expense.
    
    GET /api/expenses/
    Query parameters:
    - category: category id
    - start_date: YYYY-MM-DD
    - end_date: YYYY-MM-DD
    - payment_method: CASH, CARD, UPI, BANK_TRANSFER, WALLET, OTHER
    - search: text in description or notes
    - ordering: field (e.g. -date, amount)
    - page, page_size: pagination
    """
    
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'notes', 'category__name']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Expense.objects.filter(
            user=user,
            is_deleted=False
        ).select_related('category')

        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)

        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        # Filter by payment method
        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method.upper())

        # Filter by month and year (convenience query)
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            queryset = queryset.filter(date__month=month)
        if year:
            queryset = queryset.filter(date__year=year)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            return StandardResponse.success(
                data=paginated_response.data,
                message="Expenses retrieved successfully."
            )

        serializer = self.get_serializer(queryset, many=True)
        return StandardResponse.success(
            data=serializer.data,
            message="Expenses retrieved successfully."
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        expense = serializer.save()
        return StandardResponse.success(
            data=ExpenseSerializer(expense, context={'request': request}).data,
            message="Expense recorded successfully.",
            status_code=status.HTTP_201_CREATED
        )


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a single expense.
    
    GET /api/expenses/{id}/
    PUT / PATCH /api/expenses/{id}/
    DELETE /api/expenses/{id}/
    """
    
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('category')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return StandardResponse.success(
            data=serializer.data,
            message="Expense retrieved successfully."
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated_expense = serializer.save()

        return StandardResponse.success(
            data=ExpenseSerializer(updated_expense, context={'request': request}).data,
            message="Expense updated successfully."
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Soft delete
        instance.is_deleted = True
        instance.save()
        return StandardResponse.success(
            data=None,
            message="Expense deleted successfully.",
            status_code=status.HTTP_200_OK
        )
