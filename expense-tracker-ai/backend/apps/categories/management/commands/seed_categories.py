"""Management command to seed default income and expense categories."""

from django.core.management.base import BaseCommand
from apps.categories.models import Category


class Command(BaseCommand):
    help = 'Seeds system default categories for expenses and income.'

    DEFAULT_EXPENSE_CATEGORIES = [
        {'name': 'Food', 'icon': 'Utensils', 'color': '#EF4444', 'description': 'Groceries, restaurants, and food delivery'},
        {'name': 'Travel', 'icon': 'Plane', 'color': '#3B82F6', 'description': 'Flights, public transport, and fuel'},
        {'name': 'Shopping', 'icon': 'ShoppingBag', 'color': '#EC4899', 'description': 'Clothing, gadgets, and personal items'},
        {'name': 'Rent', 'icon': 'Home', 'color': '#8B5CF6', 'description': 'Apartment and housing rent'},
        {'name': 'Education', 'icon': 'GraduationCap', 'color': '#10B981', 'description': 'Courses, books, and tuition'},
        {'name': 'Utilities', 'icon': 'Zap', 'color': '#F59E0B', 'description': 'Electricity, water, internet, and phone bills'},
        {'name': 'Others', 'icon': 'MoreHorizontal', 'color': '#6B7280', 'description': 'Miscellaneous expenses'},
    ]

    DEFAULT_INCOME_CATEGORIES = [
        {'name': 'Salary', 'icon': 'Briefcase', 'color': '#10B981', 'description': 'Monthly employment salary'},
        {'name': 'Business', 'icon': 'TrendingUp', 'color': '#06B6D4', 'description': 'Business revenue and dividends'},
        {'name': 'Freelancing', 'icon': 'Laptop', 'color': '#6366F1', 'description': 'Freelance projects and contracts'},
        {'name': 'Investment', 'icon': 'PiggyBank', 'color': '#F59E0B', 'description': 'Stocks, mutual funds, and interest'},
        {'name': 'Other Income', 'icon': 'PlusCircle', 'color': '#84CC16', 'description': 'Gifts, refunds, and extra income'},
    ]

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding default categories...'))
        
        created_count = 0
        updated_count = 0

        # Seed Expenses
        for item in self.DEFAULT_EXPENSE_CATEGORIES:
            cat, created = Category.objects.update_or_create(
                user=None,
                name=item['name'],
                type='EXPENSE',
                defaults={
                    'icon': item['icon'],
                    'color': item['color'],
                    'description': item['description'],
                    'is_default': True,
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        # Seed Income
        for item in self.DEFAULT_INCOME_CATEGORIES:
            cat, created = Category.objects.update_or_create(
                user=None,
                name=item['name'],
                type='INCOME',
                defaults={
                    'icon': item['icon'],
                    'color': item['color'],
                    'description': item['description'],
                    'is_default': True,
                    'is_active': True,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded categories: {created_count} created, {updated_count} updated."
            )
        )
