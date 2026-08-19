"""Tests for Expense models and APIs."""

from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from apps.accounts.models import CustomUser
from apps.categories.models import Category
from apps.expenses.models import Expense


class ExpenseAPITest(APITestCase):
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

        self.expense_cat = Category.objects.create(
            user=None,
            name='Food',
            type='EXPENSE',
            is_default=True
        )

        self.income_cat = Category.objects.create(
            user=None,
            name='Salary',
            type='INCOME',
            is_default=True
        )

        login_res = self.client.post('/api/auth/login/', {
            'email': 'user1@example.com',
            'password': 'Password123'
        }, format='json')
        self.token1 = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')

    def test_create_expense_success(self):
        """Test creating an expense record."""
        res = self.client.post('/api/expenses/', {
            'category_id': self.expense_cat.id,
            'amount': '450.00',
            'date': '2026-08-15',
            'payment_method': 'UPI',
            'description': 'Lunch with team'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['data']['amount'], '450.00')

    def test_create_expense_with_income_category_fails(self):
        """Expense cannot be created with INCOME category."""
        res = self.client.post('/api/expenses/', {
            'category_id': self.income_cat.id,
            'amount': '500.00',
            'date': '2026-08-15'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.data['success'])

    def test_negative_amount_rejected(self):
        """Negative or zero amount is rejected."""
        res = self.client.post('/api/expenses/', {
            'category_id': self.expense_cat.id,
            'amount': '-10.00',
            'date': '2026-08-15'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_ownership_isolation(self):
        """User cannot access or modify another user's expense."""
        user2_exp = Expense.objects.create(
            user=self.user2,
            category=self.expense_cat,
            amount=Decimal('100.00'),
            date='2026-08-15'
        )

        res = self.client.get(f'/api/expenses/{user2_exp.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        res = self.client.delete(f'/api/expenses/{user2_exp.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_soft_delete_expense(self):
        """Deleting an expense marks it as is_deleted=True."""
        exp = Expense.objects.create(
            user=self.user1,
            category=self.expense_cat,
            amount=Decimal('200.00'),
            date='2026-08-15'
        )
        res = self.client.delete(f'/api/expenses/{exp.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        exp.refresh_from_db()
        self.assertTrue(exp.is_deleted)
