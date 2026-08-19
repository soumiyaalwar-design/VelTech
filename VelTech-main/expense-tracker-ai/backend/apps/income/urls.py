"""URL routing for income API."""

from django.urls import path
from apps.income import views

urlpatterns = [
    path('', views.IncomeListCreateView.as_view(), name='income-list-create'),
    path('<int:pk>/', views.IncomeDetailView.as_view(), name='income-detail'),
]
