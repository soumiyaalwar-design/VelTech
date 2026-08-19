"""Tests for Income models and APIs."""

from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from apps.accounts.models import CustomUser
from apps.categories.models import Category
from apps.income.models import Income


class IncomeAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = CustomUser.objects.create_user(
            email='user1@example.com',
            password='Password123',
            first_name='User1'
        )
        self.user2 = CustomUser.objects.create_user(
            email='user2@example.com',
            password='Password123',
            first_name='User2'
        )

        self.income_cat = Category.objects.create(
            user=None,
            name='Salary',
            type='INCOME',
            is_default=True
        )

        self.expense_cat = Category.objects.create(
            user=None,
            name='Food',
            type='EXPENSE',
            is_default=True
        )

        login_res = self.client.post('/api/auth/login/', {
            'email': 'user1@example.com',
            'password': 'Password123'
        }, format='json')
        self.token1 = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')

    def test_create_income_success(self):
        """Test creating an income record."""
        res = self.client.post('/api/income/', {
            'category_id': self.income_cat.id,
            'amount': '50000.00',
            'date': '2026-08-01',
            'payment_method': 'BANK_TRANSFER',
            'description': 'August Salary'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['data']['amount'], '50000.00')

    def test_create_income_with_expense_category_fails(self):
        """Income cannot be created with EXPENSE category."""
        res = self.client.post('/api/income/', {
            'category_id': self.expense_cat.id,
            'amount': '5000.00',
            'date': '2026-08-01'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.data['success'])

    def test_income_ownership_isolation(self):
        """User cannot access other users' income records."""
        user2_inc = Income.objects.create(
            user=self.user2,
            category=self.income_cat,
            amount=Decimal('10000.00'),
            date='2026-08-01'
        )
        res = self.client.get(f'/api/income/{user2_inc.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
