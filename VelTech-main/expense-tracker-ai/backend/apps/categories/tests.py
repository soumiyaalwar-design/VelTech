"""Tests for Category models and APIs."""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from apps.accounts.models import CustomUser
from apps.categories.models import Category


class CategoryAPITest(APITestCase):
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

        # Default system category
        self.default_cat = Category.objects.create(
            user=None,
            name='Food',
            type='EXPENSE',
            is_default=True
        )

        # Custom category for user1
        self.custom_cat = Category.objects.create(
            user=self.user1,
            name='Consulting',
            type='INCOME',
            is_default=False
        )

        # Login user1
        login_res = self.client.post('/api/auth/login/', {
            'email': 'user1@example.com',
            'password': 'Password123'
        }, format='json')
        self.token1 = login_res.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token1}')

    def test_list_categories(self):
        """User should see default categories and their own custom categories."""
        res = self.client.get('/api/categories/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        category_names = [c['name'] for c in res.data['data']]
        self.assertIn('Food', category_names)
        self.assertIn('Consulting', category_names)

    def test_filter_by_type(self):
        """Filter categories by type."""
        res = self.client.get('/api/categories/?type=EXPENSE')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for cat in res.data['data']:
            self.assertEqual(cat['type'], 'EXPENSE')

    def test_create_custom_category(self):
        """User can create custom category."""
        res = self.client.post('/api/categories/', {
            'name': 'Gym',
            'type': 'EXPENSE',
            'icon': 'Dumbbell',
            'color': '#10B981'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['data']['name'], 'Gym')
        self.assertTrue(Category.objects.filter(user=self.user1, name='Gym').exists())

    def test_cannot_modify_default_category(self):
        """User cannot modify system default category."""
        res = self.client.put(f'/api/categories/{self.default_cat.id}/', {
            'name': 'Food & Drinks',
            'type': 'EXPENSE'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_modify_other_user_category(self):
        """User cannot modify another user's category."""
        user2_cat = Category.objects.create(
            user=self.user2,
            name='User2 Category',
            type='EXPENSE'
        )
        res = self.client.put(f'/api/categories/{user2_cat.id}/', {
            'name': 'Hacked',
            'type': 'EXPENSE'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
