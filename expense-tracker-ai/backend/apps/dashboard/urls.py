"""URL routing for dashboard API."""

from django.urls import path
from apps.dashboard import views

urlpatterns = [
    path('', views.DashboardSummaryView.as_view(), name='dashboard-summary'),
]
