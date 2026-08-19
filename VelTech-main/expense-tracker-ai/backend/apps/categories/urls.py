"""URL routing for categories API."""

from django.urls import path
from apps.categories import views

urlpatterns = [
    path('', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
]
