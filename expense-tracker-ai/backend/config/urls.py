"""
URL configuration for Expense Tracker System.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),

    # Authentication routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/v1/auth/', include('apps.accounts.urls')),

    # Categories routes
    path('api/categories/', include('apps.categories.urls')),
    path('api/v1/categories/', include('apps.categories.urls')),

    # Expenses routes
    path('api/expenses/', include('apps.expenses.urls')),
    path('api/v1/expenses/', include('apps.expenses.urls')),

    # Income routes
    path('api/income/', include('apps.income.urls')),
    path('api/v1/income/', include('apps.income.urls')),

    # Budgets routes
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/v1/budgets/', include('apps.budgets.urls')),

    # Dashboard routes
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),

    # Reports & Export routes
    path('api/reports/', include('apps.reports.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
]
