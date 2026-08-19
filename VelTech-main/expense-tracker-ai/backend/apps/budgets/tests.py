"""Tests for Budget models and APIs."""

from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from apps.accounts.models import CustomUser
from apps.categories.models import Category
from apps.expenses.models import Expense
from apps.budgets.models import Budget


class BudgetAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='budgetuser@example.com',
            password='Password123',
            first_name='Budget'
        )

        self.expense_cat = Category.objects.create(
            user=None,
            name='Food',
            type='EXPENSE',
            is_default=True
        )

        login_res = self.client.post('/api/auth/login/', {
            'email': 'budgetuser@example.com',
            'password': 'Password123'
        }, format='json')
        self.token = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_budget_and_calculate_utilization(self):
        """Test budget creation and real-time utilization calculation."""
        # Create an expense of 2500 in August 2026
        Expense.objects.create(
            user=self.user,
            category=self.expense_cat,
            amount=Decimal('2500.00'),
            date='2026-08-10'
        )

        # Create a budget of 5000 for August 2026
        res = self.client.post('/api/budgets/', {
            'category_id': self.expense_cat.id,
            'amount': '5000.00',
            'month': 8,
            'year': 2026,
            'alert_percentage': '80.00'
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['data']['actual_expense'], '2500.00')
        self.assertEqual(res.data['data']['remaining_amount'], '2500.00')
        self.assertEqual(res.data['data']['usage_percentage'], 50.0)
        self.assertEqual(res.data['data']['status'], 'HEALTHY')

    def test_duplicate_budget_rejected(self):
        """Cannot create duplicate budget for same user, category, month, and year."""
        Budget.objects.create(
            user=self.user,
            category=self.expense_cat,
            amount=Decimal('5000.00'),
            month=8,
            year=2026
        )

        res = self.client.post('/api/budgets/', {
            'category_id': self.expense_cat.id,
            'amount': '6000.00',
            'month': 8,
            'year': 2026
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.data['success'])
