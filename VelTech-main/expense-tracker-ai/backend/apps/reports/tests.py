"""Tests for Reports and Export APIs."""

from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from apps.accounts.models import CustomUser
from apps.categories.models import Category
from apps.expenses.models import Expense
from apps.income.models import Income


class ReportsAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='repuser@example.com',
            password='Password123',
            first_name='Report'
        )

        self.salary_cat = Category.objects.create(
            user=None, name='Salary', type='INCOME', is_default=True
        )
        self.food_cat = Category.objects.create(
            user=None, name='Food', type='EXPENSE', is_default=True
        )

        Income.objects.create(
            user=self.user,
            category=self.salary_cat,
            amount=Decimal('50000.00'),
            date='2026-08-01'
        )
        Expense.objects.create(
            user=self.user,
            category=self.food_cat,
            amount=Decimal('5000.00'),
            date='2026-08-05'
        )

        login_res = self.client.post('/api/auth/login/', {
            'email': 'repuser@example.com',
            'password': 'Password123'
        }, format='json')
        self.token = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_report_summary(self):
        """Test GET /api/reports/summary/"""
        res = self.client.get('/api/reports/summary/?month=8&year=2026')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        data = res.data['data']
        self.assertEqual(data['total_income'], '50000.00')
        self.assertEqual(data['total_expense'], '5000.00')
        self.assertEqual(data['net_balance'], '45000.00')
        self.assertEqual(data['count'], 2)

    def test_export_csv(self):
        """Test GET /api/reports/export/csv/"""
        res = self.client.get('/api/reports/export/csv/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'text/csv')
        self.assertIn('Date,Type,Category,Amount (INR)', res.content.decode('utf-8'))

    def test_export_excel(self):
        """Test GET /api/reports/export/excel/"""
        res = self.client.get('/api/reports/export/excel/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
