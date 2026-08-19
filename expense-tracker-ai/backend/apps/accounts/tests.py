"""Tests for authentication endpoints."""

import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import CustomUser
from apps.accounts.serializers import UserRegistrationSerializer, UserLoginSerializer


class CustomUserModelTest(TestCase):
    """Test CustomUser model and manager."""
    
    def test_create_user(self):
        """Test creating a regular user."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='John',
            last_name='Doe',
            mobile_number='+919876543210'
        )
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.first_name, 'John')
        self.assertEqual(user.last_name, 'Doe')
        self.assertEqual(user.mobile_number, '+919876543210')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.check_password('TestPass123'))
    
    def test_create_superuser(self):
        """Test creating a superuser."""
        admin = CustomUser.objects.create_superuser(
            email='admin@example.com',
            password='AdminPass123',
            first_name='Admin'
        )
        
        self.assertEqual(admin.email, 'admin@example.com')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)
    
    def test_email_normalization(self):
        """Test email is normalized to lowercase."""
        user = CustomUser.objects.create_user(
            email='Test@EXAMPLE.COM',
            password='TestPass123',
            first_name='Test'
        )
        self.assertEqual(user.email, 'test@example.com')
    
    def test_duplicate_email_raises_error(self):
        """Test creating user with duplicate email raises error."""
        CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='User1'
        )
        
        with self.assertRaises(Exception):
            CustomUser.objects.create_user(
                email='test@example.com',
                password='TestPass123',
                first_name='User2'
            )
    
    def test_get_full_name(self):
        """Test get_full_name method."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='John',
            last_name='Doe'
        )
        self.assertEqual(user.get_full_name(), 'John Doe')
    
    def test_get_full_name_without_last_name(self):
        """Test get_full_name without last name."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='John'
        )
        self.assertEqual(user.get_full_name(), 'John')
    
    def test_str_representation(self):
        """Test string representation."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='John',
            last_name='Doe'
        )
        self.assertEqual(str(user), 'John Doe (test@example.com)')


class UserRegistrationSerializerTest(TestCase):
    """Test UserRegistrationSerializer validation."""
    
    def test_valid_registration(self):
        """Test valid registration data."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'mobile_number': '+919876543210',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_email_uniqueness(self):
        """Test email uniqueness validation."""
        CustomUser.objects.create_user(
            email='existing@example.com',
            password='TestPass123',
            first_name='Existing'
        )
        
        data = {
            'email': 'existing@example.com',
            'first_name': 'John',
            'password': 'NewPass123',
            'password_confirmation': 'NewPass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_password_too_short(self):
        """Test password must be at least 8 characters."""
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'password': 'Short1',
            'password_confirmation': 'Short1'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_password_missing_uppercase(self):
        """Test password must have uppercase letter."""
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'password': 'lowercasepass1',
            'password_confirmation': 'lowercasepass1'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_password_missing_lowercase(self):
        """Test password must have lowercase letter."""
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'password': 'UPPERCASEPASS1',
            'password_confirmation': 'UPPERCASEPASS1'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_password_missing_digit(self):
        """Test password must have digit."""
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'password': 'MixedCasePass',
            'password_confirmation': 'MixedCasePass'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_password_confirmation_mismatch(self):
        """Test password confirmation must match."""
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'password': 'SecurePass123',
            'password_confirmation': 'DifferentPass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirmation', serializer.errors)
    
    def test_missing_first_name(self):
        """Test first name is required."""
        data = {
            'email': 'test@example.com',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('first_name', serializer.errors)
    
    def test_empty_first_name(self):
        """Test first name cannot be empty."""
        data = {
            'email': 'test@example.com',
            'first_name': '   ',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('first_name', serializer.errors)
    
    def test_first_name_too_short(self):
        """Test first name must be at least 2 characters."""
        data = {
            'email': 'test@example.com',
            'first_name': 'A',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('first_name', serializer.errors)
    
    def test_invalid_email_format(self):
        """Test invalid email format."""
        data = {
            'email': 'invalid-email',
            'first_name': 'John',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_invalid_mobile_number_format(self):
        """Test invalid mobile number format."""
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'mobile_number': 'invalid_phone',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('mobile_number', serializer.errors)


class UserLoginSerializerTest(TestCase):
    """Test UserLoginSerializer validation."""
    
    def setUp(self):
        """Create a test user."""
        self.user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test'
        )
    
    def test_valid_login(self):
        """Test valid login credentials."""
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        serializer = UserLoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_missing_email(self):
        """Test missing email."""
        data = {
            'password': 'TestPass123'
        }
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_missing_password(self):
        """Test missing password."""
        data = {
            'email': 'test@example.com'
        }
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_invalid_password(self):
        """Test invalid password."""
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword'
        }
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
    
    def test_nonexistent_user(self):
        """Test login with non-existent user."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123'
        }
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
    
    def test_inactive_user(self):
        """Test login with inactive user."""
        self.user.is_active = False
        self.user.save()
        
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        serializer = UserLoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())


class AuthenticationAPITest(APITestCase):
    """Integration tests for authentication endpoints."""
    
    def setUp(self):
        """Set up test client and data."""
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.token_refresh_url = reverse('token_refresh')
        self.logout_url = reverse('logout')
        self.current_user_url = reverse('current_user')
        self.change_password_url = reverse('change_password')
    
    def test_register_success(self):
        """Test successful user registration."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'mobile_number': '+919876543210',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['email'], 'newuser@example.com')
        self.assertTrue(CustomUser.objects.filter(email='newuser@example.com').exists())
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        CustomUser.objects.create_user(
            email='existing@example.com',
            password='TestPass123',
            first_name='Existing'
        )
        
        data = {
            'email': 'existing@example.com',
            'first_name': 'John',
            'password': 'SecurePass123',
            'password_confirmation': 'SecurePass123'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('email', response.data['errors'])
    
    def test_register_password_mismatch(self):
        """Test registration with mismatched passwords."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'John',
            'password': 'SecurePass123',
            'password_confirmation': 'DifferentPass123'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_register_weak_password(self):
        """Test registration with weak password."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'John',
            'password': 'weak',
            'password_confirmation': 'weak'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_login_success(self):
        """Test successful login."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test'
        )
        
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])
        self.assertEqual(response.data['data']['user']['email'], 'test@example.com')
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test'
        )
        
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_login_inactive_user(self):
        """Test login with inactive user."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test'
        )
        user.is_active = False
        user.save()
        
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_token_refresh(self):
        """Test token refresh endpoint."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test'
        )
        
        # Login to get refresh token
        login_data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        refresh_token = login_response.data['data']['refresh']
        
        # Refresh token
        refresh_data = {'refresh': refresh_token}
        response = self.client.post(self.token_refresh_url, refresh_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])
    
    def test_get_current_user(self):
        """Test getting current user profile."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='John',
            last_name='Doe',
            mobile_number='+919876543210'
        )
        
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        access_token = login_response.data['data']['access']
        
        # Get current user
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.current_user_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['email'], 'test@example.com')
        self.assertEqual(response.data['data']['first_name'], 'John')
    
    def test_update_user_profile(self):
        """Test updating user profile."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='John'
        )
        
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        access_token = login_response.data['data']['access']
        
        # Update profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        update_data = {
            'first_name': 'Jane',
            'last_name': 'Doe',
            'mobile_number': '+919876543210'
        }
        response = self.client.patch(self.current_user_url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['first_name'], 'Jane')
        self.assertEqual(response.data['data']['last_name'], 'Doe')
    
    def test_change_password(self):
        """Test changing password."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='OldPass123',
            first_name='Test'
        )
        
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'OldPass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        access_token = login_response.data['data']['access']
        
        # Change password
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        change_pwd_data = {
            'old_password': 'OldPass123',
            'new_password': 'NewPass456',
            'password_confirmation': 'NewPass456'
        }
        response = self.client.post(self.change_password_url, change_pwd_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify old password doesn't work
        old_login = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(old_login.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify new password works
        new_login_data = {
            'email': 'test@example.com',
            'password': 'NewPass456'
        }
        new_login = self.client.post(self.login_url, new_login_data, format='json')
        self.assertEqual(new_login.status_code, status.HTTP_200_OK)
    
    def test_change_password_wrong_old_password(self):
        """Test changing password with wrong old password."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test'
        )
        
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        access_token = login_response.data['data']['access']
        
        # Try to change password with wrong old password
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        change_pwd_data = {
            'old_password': 'WrongPassword',
            'new_password': 'NewPass456',
            'password_confirmation': 'NewPass456'
        }
        response = self.client.post(self.change_password_url, change_pwd_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
    
    def test_logout(self):
        """Test logout endpoint."""
        user = CustomUser.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            first_name='Test'
        )
        
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        refresh_token = login_response.data['data']['refresh']
        access_token = login_response.data['data']['access']
        
        # Logout
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_data = {'refresh': refresh_token}
        response = self.client.post(self.logout_url, logout_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_unauthenticated_access_to_protected_endpoint(self):
        """Test unauthenticated access to protected endpoint."""
        response = self.client.get(self.current_user_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_invalid_token_access(self):
        """Test access with invalid token."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get(self.current_user_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
