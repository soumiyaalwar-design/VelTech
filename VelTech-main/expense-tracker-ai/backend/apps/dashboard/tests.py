"""Tests for Dashboard APIs."""

from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from apps.accounts.models import CustomUser
from apps.categories.models import Category
from apps.expenses.models import Expense
from apps.income.models import Income
from apps.budgets.models import Budget


class DashboardAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='dashuser@example.com',
            password='Password123',
            first_name='Dash'
        )

        self.salary_cat = Category.objects.create(
            user=None, name='Salary', type='INCOME', is_default=True
        )
        self.food_cat = Category.objects.create(
            user=None, name='Food', type='EXPENSE', is_default=True
        )

        # Seed data for user
        Income.objects.create(
            user=self.user,
            category=self.salary_cat,
            amount=Decimal('80000.00'),
            date='2026-08-01'
        )
        Expense.objects.create(
            user=self.user,
            category=self.food_cat,
            amount=Decimal('15000.00'),
            date='2026-08-05'
        )

        login_res = self.client.post('/api/auth/login/', {
            'email': 'dashuser@example.com',
            'password': 'Password123'
        }, format='json')
        self.token = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_dashboard_summary_metrics(self):
        """Test GET /api/dashboard/ returns correct calculations."""
        res = self.client.get('/api/dashboard/?month=8&year=2026')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        data = res.data['data']

        self.assertEqual(data['total_income'], '80000.00')
        self.assertEqual(data['total_expense'], '15000.00')
        self.assertEqual(data['balance'], '65000.00')
        self.assertEqual(data['monthly_income'], '80000.00')
        self.assertEqual(data['monthly_expense'], '15000.00')
        self.assertTrue(len(data['recent_transactions']) > 0)
        self.assertTrue(len(data['category_expenses']) > 0)
        self.assertTrue(len(data['monthly_summary']) == 6)
