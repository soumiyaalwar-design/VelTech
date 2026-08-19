from django.db import migrations

def seed_default_categories(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    
    DEFAULT_EXPENSES = [
        {'name': 'Food', 'icon': 'Utensils', 'color': '#EF4444', 'description': 'Groceries, restaurants, and food delivery'},
        {'name': 'Travel', 'icon': 'Plane', 'color': '#3B82F6', 'description': 'Flights, public transport, and fuel'},
        {'name': 'Shopping', 'icon': 'ShoppingBag', 'color': '#EC4899', 'description': 'Clothing, gadgets, and personal items'},
        {'name': 'Rent', 'icon': 'Home', 'color': '#8B5CF6', 'description': 'Apartment and housing rent'},
        {'name': 'Education', 'icon': 'GraduationCap', 'color': '#10B981', 'description': 'Courses, books, and tuition'},
        {'name': 'Utilities', 'icon': 'Zap', 'color': '#F59E0B', 'description': 'Electricity, water, internet, and phone bills'},
        {'name': 'Others', 'icon': 'MoreHorizontal', 'color': '#6B7280', 'description': 'Miscellaneous expenses'},
    ]

    DEFAULT_INCOMES = [
        {'name': 'Salary', 'icon': 'Briefcase', 'color': '#10B981', 'description': 'Monthly employment salary'},
        {'name': 'Business', 'icon': 'TrendingUp', 'color': '#06B6D4', 'description': 'Business revenue and dividends'},
        {'name': 'Freelancing', 'icon': 'Laptop', 'color': '#6366F1', 'description': 'Freelance projects and contracts'},
        {'name': 'Investment', 'icon': 'PiggyBank', 'color': '#F59E0B', 'description': 'Stocks, mutual funds, and interest'},
        {'name': 'Other Income', 'icon': 'PlusCircle', 'color': '#84CC16', 'description': 'Gifts, refunds, and extra income'},
    ]

    for item in DEFAULT_EXPENSES:
        Category.objects.get_or_create(
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

    for item in DEFAULT_INCOMES:
        Category.objects.get_or_create(
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

def reverse_func(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    Category.objects.filter(is_default=True).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_default_categories, reverse_func),
    ]
