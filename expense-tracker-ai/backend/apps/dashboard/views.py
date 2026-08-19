"""Views for Dashboard API."""

from decimal import Decimal
from datetime import datetime, date
import calendar
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework import permissions, status

from apps.expenses.models import Expense
from apps.income.models import Income
from apps.budgets.models import Budget
from apps.budgets.serializers import BudgetSerializer
from core.exceptions import StandardResponse


class DashboardSummaryView(APIView):
    """
    Dashboard dynamic financial summary view.
    
    GET /api/dashboard/
    Optional query params:
    - month: integer 1-12 (defaults to current month)
    - year: integer (defaults to current year)
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        try:
            selected_month = int(request.query_params.get('month', today.month))
            selected_year = int(request.query_params.get('year', today.year))
        except ValueError:
            selected_month = today.month
            selected_year = today.year

        # 1. Total All-time Income & Expense
        total_income = Income.objects.filter(
            user=user, is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_expense = Expense.objects.filter(
            user=user, is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        balance = total_income - total_expense

        # 2. Selected Month Income & Expense
        monthly_income = Income.objects.filter(
            user=user,
            is_deleted=False,
            date__year=selected_year,
            date__month=selected_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        monthly_expense = Expense.objects.filter(
            user=user,
            is_deleted=False,
            date__year=selected_year,
            date__month=selected_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        monthly_balance = monthly_income - monthly_expense
        savings_rate = 0.0
        if monthly_income > Decimal('0.00'):
            savings_rate = round(float(((monthly_income - monthly_expense) / monthly_income) * 100), 2)

        # 3. Category Expenses Breakdown (for selected month/all time)
        # We group by category for the selected month (or all-time if month has no data)
        cat_expenses_qs = Expense.objects.filter(
            user=user,
            is_deleted=False,
            date__year=selected_year,
            date__month=selected_month
        ).values(
            'category_id', 'category__name', 'category__color', 'category__icon'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # If selected month has no expenses, fetch all-time category distribution as fallback
        if not cat_expenses_qs.exists() and total_expense > Decimal('0.00'):
            cat_expenses_qs = Expense.objects.filter(
                user=user,
                is_deleted=False
            ).values(
                'category_id', 'category__name', 'category__color', 'category__icon'
            ).annotate(
                total=Sum('amount'),
                count=Count('id')
            ).order_by('-total')

        base_expense_for_pct = monthly_expense if monthly_expense > Decimal('0.00') else total_expense
        category_expenses = []
        for cat in cat_expenses_qs:
            amount = cat['total'] or Decimal('0.00')
            pct = 0.0
            if base_expense_for_pct > Decimal('0.00'):
                pct = round(float((amount / base_expense_for_pct) * 100), 2)
            
            category_expenses.append({
                'id': cat['category_id'],
                'category': cat['category__name'],
                'amount': str(amount),
                'percentage': pct,
                'color': cat['category__color'] or '#6366F1',
                'icon': cat['category__icon'] or 'Tag',
                'count': cat['count']
            })

        # 4. Monthly Trend (Past 6 Months)
        monthly_summary = []
        for i in range(5, -1, -1):
            total_months = today.year * 12 + today.month - 1 - i
            m_year = total_months // 12
            m_month = total_months % 12 + 1
            target_date = date(m_year, m_month, 1)
            m_label = target_date.strftime('%b %Y')
            m_code = target_date.strftime('%Y-%m')

            m_inc = Income.objects.filter(
                user=user,
                is_deleted=False,
                date__year=m_year,
                date__month=m_month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            m_exp = Expense.objects.filter(
                user=user,
                is_deleted=False,
                date__year=m_year,
                date__month=m_month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            monthly_summary.append({
                'month': m_label,
                'month_code': m_code,
                'income': float(m_inc),
                'expense': float(m_exp),
                'savings': float(m_inc - m_exp)
            })

        # 5. Recent Transactions (combined 8 most recent entries)
        recent_expenses = list(Expense.objects.filter(
            user=user, is_deleted=False
        ).select_related('category').order_by('-date', '-created_at')[:8])

        recent_incomes = list(Income.objects.filter(
            user=user, is_deleted=False
        ).select_related('category').order_by('-date', '-created_at')[:8])

        combined_transactions = []
        for exp in recent_expenses:
            combined_transactions.append({
                'id': f"exp-{exp.id}",
                'raw_id': exp.id,
                'type': 'EXPENSE',
                'description': exp.description or exp.category.name,
                'category': exp.category.name,
                'category_icon': exp.category.icon,
                'category_color': exp.category.color,
                'amount': str(exp.amount),
                'date': exp.date.strftime('%Y-%m-%d'),
                'payment_method': exp.payment_method,
                'created_at': exp.created_at.isoformat()
            })

        for inc in recent_incomes:
            combined_transactions.append({
                'id': f"inc-{inc.id}",
                'raw_id': inc.id,
                'type': 'INCOME',
                'description': inc.description or inc.category.name,
                'category': inc.category.name,
                'category_icon': inc.category.icon,
                'category_color': inc.category.color,
                'amount': str(inc.amount),
                'date': inc.date.strftime('%Y-%m-%d'),
                'payment_method': inc.payment_method,
                'created_at': inc.created_at.isoformat()
            })

        # Sort combined by date descending, then created_at descending
        combined_transactions.sort(key=lambda x: (x['date'], x['created_at']), reverse=True)
        recent_transactions = combined_transactions[:10]

        # 6. Active Budgets Summary for Selected Month
        active_budgets = Budget.objects.filter(
            user=user,
            year=selected_year,
            month=selected_month
        ).select_related('category')
        budget_serializer = BudgetSerializer(active_budgets, many=True, context={'request': request})

        payload = {
            'total_income': f"{Decimal(total_income):.2f}",
            'total_expense': f"{Decimal(total_expense):.2f}",
            'balance': f"{Decimal(balance):.2f}",
            'monthly_income': f"{Decimal(monthly_income):.2f}",
            'monthly_expense': f"{Decimal(monthly_expense):.2f}",
            'monthly_balance': f"{Decimal(monthly_balance):.2f}",
            'savings_rate': savings_rate,
            'selected_month': selected_month,
            'selected_year': selected_year,
            'recent_transactions': recent_transactions,
            'category_expenses': category_expenses,
            'monthly_summary': monthly_summary,
            'budget_summary': budget_serializer.data
        }

        return StandardResponse.success(
            data=payload,
            message="Dashboard summary calculated successfully."
        )
