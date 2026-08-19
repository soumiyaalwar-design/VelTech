"""URL routing for reports and export API."""

from django.urls import path
from apps.reports import views

urlpatterns = [
    path('summary/', views.ReportSummaryView.as_view(), name='report-summary'),
    path('export/csv/', views.ExportCSVView.as_view(), name='report-export-csv'),
    path('export/excel/', views.ExportExcelView.as_view(), name='report-export-excel'),
]
