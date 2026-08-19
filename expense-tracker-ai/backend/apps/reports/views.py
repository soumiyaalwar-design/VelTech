"""Views for Reports and Data Export (CSV / Excel)."""

import csv
import io
from decimal import Decimal
from datetime import datetime
from django.http import HttpResponse
from django.db.models import Sum, Q
from rest_framework.views import APIView
from rest_framework import permissions, status

from apps.expenses.models import Expense
from apps.income.models import Income
from core.exceptions import StandardResponse

# Optional Excel library openpyxl
try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False


def get_filtered_transactions(user, params):
    """Helper to retrieve and filter combined expenses and incomes."""
    month = params.get('month')
    year = params.get('year')
    start_date = params.get('start_date')
    end_date = params.get('end_date')
    category_id = params.get('category')
    transaction_type = params.get('type', 'ALL').upper()

    expenses_qs = Expense.objects.filter(user=user, is_deleted=False).select_related('category')
    incomes_qs = Income.objects.filter(user=user, is_deleted=False).select_related('category')

    # Apply date filters
    if start_date:
        expenses_qs = expenses_qs.filter(date__gte=start_date)
        incomes_qs = incomes_qs.filter(date__gte=start_date)
    if end_date:
        expenses_qs = expenses_qs.filter(date__lte=end_date)
        incomes_qs = incomes_qs.filter(date__lte=end_date)
    if month:
        expenses_qs = expenses_qs.filter(date__month=month)
        incomes_qs = incomes_qs.filter(date__month=month)
    if year:
        expenses_qs = expenses_qs.filter(date__year=year)
        incomes_qs = incomes_qs.filter(date__year=year)
    if category_id:
        expenses_qs = expenses_qs.filter(category_id=category_id)
        incomes_qs = incomes_qs.filter(category_id=category_id)

    records = []
    if transaction_type in ['ALL', 'EXPENSE']:
        for exp in expenses_qs:
            records.append({
                'id': f"exp-{exp.id}",
                'raw_id': exp.id,
                'type': 'EXPENSE',
                'category': exp.category.name,
                'category_id': exp.category.id,
                'amount': exp.amount,
                'date': exp.date,
                'payment_method': exp.payment_method,
                'description': exp.description or '',
                'notes': exp.notes or '',
                'created_at': exp.created_at
            })

    if transaction_type in ['ALL', 'INCOME']:
        for inc in incomes_qs:
            records.append({
                'id': f"inc-{inc.id}",
                'raw_id': inc.id,
                'type': 'INCOME',
                'category': inc.category.name,
                'category_id': inc.category.id,
                'amount': inc.amount,
                'date': inc.date,
                'payment_method': inc.payment_method,
                'description': inc.description or '',
                'notes': inc.notes or '',
                'created_at': inc.created_at
            })

    records.sort(key=lambda x: (x['date'], x['created_at']), reverse=True)
    return records


class ReportSummaryView(APIView):
    """
    Returns filtered report summaries and transactions table.
    
    GET /api/reports/summary/
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        records = get_filtered_transactions(request.user, request.query_params)
        
        total_income = sum((r['amount'] for r in records if r['type'] == 'INCOME'), Decimal('0.00'))
        total_expense = sum((r['amount'] for r in records if r['type'] == 'EXPENSE'), Decimal('0.00'))
        net_balance = total_income - total_expense

        serialized_records = []
        for r in records:
            serialized_records.append({
                'id': r['id'],
                'type': r['type'],
                'category': r['category'],
                'category_id': r['category_id'],
                'amount': str(r['amount']),
                'date': r['date'].strftime('%Y-%m-%d'),
                'payment_method': r['payment_method'],
                'description': r['description'],
                'notes': r['notes']
            })

        return StandardResponse.success(
            data={
                'total_income': str(total_income),
                'total_expense': str(total_expense),
                'net_balance': str(net_balance),
                'count': len(records),
                'transactions': serialized_records
            },
            message="Report summary generated successfully."
        )


class ExportCSVView(APIView):
    """
    Generates and streams a CSV export of filtered transactions.
    
    GET /api/reports/export/csv/
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        records = get_filtered_transactions(request.user, request.query_params)
        
        response = HttpResponse(content_type='text/csv')
        filename = f"expense_tracker_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Description', 'Notes'])

        for r in records:
            writer.writerow([
                r['date'].strftime('%Y-%m-%d'),
                r['type'],
                r['category'],
                str(r['amount']),
                r['payment_method'],
                r['description'],
                r['notes']
            ])

        return response


class ExportExcelView(APIView):
    """
    Generates and returns an Excel (.xlsx) workbook of filtered transactions.
    
    GET /api/reports/export/excel/
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        records = get_filtered_transactions(request.user, request.query_params)
        filename = f"expense_tracker_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

        if not OPENPYXL_AVAILABLE:
            # Fallback to CSV format if openpyxl not installed
            return ExportCSVView().get(request)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Transactions Report"
        ws.views.sheetView[0].showGridLines = True

        # Header Styles
        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        border_side = Side(border_style="thin", color="E2E8F0")
        cell_border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)

        headers = ['Date', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Description', 'Notes']
        ws.append(headers)

        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")

        income_font = Font(color="10B981", bold=True)
        expense_font = Font(color="EF4444", bold=True)

        # Write Data
        for row_idx, r in enumerate(records, start=2):
            ws.append([
                r['date'].strftime('%Y-%m-%d'),
                r['type'],
                r['category'],
                float(r['amount']),
                r['payment_method'],
                r['description'],
                r['notes']
            ])
            
            # Format type column color
            type_cell = ws.cell(row=row_idx, column=2)
            type_cell.font = income_font if r['type'] == 'INCOME' else expense_font
            type_cell.alignment = Alignment(horizontal="center")

            # Format amount column
            amount_cell = ws.cell(row=row_idx, column=4)
            amount_cell.number_format = '₹#,##0.00'
            amount_cell.alignment = Alignment(horizontal="right")

            # Border for all cells
            for col_idx in range(1, len(headers) + 1):
                ws.cell(row=row_idx, column=col_idx).border = cell_border

        # Adjust Column Widths
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
