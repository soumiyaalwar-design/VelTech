# Expense Tracker System — Full-Stack SaaS Application

An enterprise-grade, full-stack personal finance and expense tracking web application engineered with **React.js**, **Django REST Framework**, and **MySQL 8.x**, featuring dynamic financial analytics, proactive monthly budget tracking with utilization progress, interactive **Recharts** visualizations, and one-click **CSV/Excel data export**.

---

## 🌟 Key Features

* **🔐 JWT Authentication:** Secure registration, login, token refresh, password changes, and authenticated profile management.
* **🏷️ Dual Category Architecture:** Pre-seeded default categories (*Food, Travel, Shopping, Rent, Salary, Freelancing, etc.*) plus support for custom user-created categories.
* **💸 Expense & Income Management:** Full CRUD operations, pagination, search, category filtering, and date range query support.
* **🎯 Proactive Budgeting:** Monthly budget configuration per category with real-time calculated actual spend, remaining funds, and usage percentages.
* **📊 Visual Analytics Dashboard:** Real-time KPI summary cards (Total Income, Total Expense, Net Balance, Monthly Burn), Recharts Category Donut Chart, and Monthly Income vs. Expense Bar Chart.
* **📁 Reports & File Exports:** Dynamic transaction report filtering with one-click export to CSV and Excel (`.xlsx`) workbooks.
* **🎨 Premium SaaS Interface:** Modern financial UI inspired by Stripe and Linear with high-contrast typography, responsive layout (desktop down to mobile), smooth modal transitions, skeleton loaders, and empty states.

---

## 🏗️ Architecture & Technology Stack

```
React Frontend (Vite + Recharts + Axios)
       │
       │ HTTPS / REST (Standard JSON Envelope)
       ▼
Django REST Framework (Simple JWT + Permissions + Serializers)
       │
       │ Django ORM (DecimalField Monetary Precision)
       ▼
MySQL Database 8.x
```

* **Frontend:** React 18, React Router v6, Axios, Recharts, Lucide Icons, Modern SaaS CSS Design System.
* **Backend:** Python 3.12, Django 4.2, Django REST Framework 3.14, Simple JWT, `django-filter`, `django-cors-headers`, `openpyxl`.
* **Database:** MySQL 8.x (with local SQLite development capability).

---

## 📁 Repository Structure

```
expense-tracker/
├── backend/
│   ├── apps/
│   │   ├── accounts/      # User authentication, JWT tokens, profile management
│   │   ├── categories/    # Default and custom categories
│   │   ├── expenses/      # Expense tracking and validation
│   │   ├── income/        # Income tracking and validation
│   │   ├── budgets/       # Monthly budget limits & utilization metrics
│   │   ├── dashboard/     # Aggregated financial KPIs and chart data
│   │   └── reports/       # Filtered summaries and CSV/Excel file exporters
│   ├── config/            # Django project settings and master URL router
│   ├── core/              # Global exception handler & standard response wrappers
│   ├── manage.py
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI cards, tables, charts, modals, layout
│   │   ├── context/       # AuthContext and Toast notification system
│   │   ├── pages/         # Dashboard, Expenses, Income, Budgets, Reports, etc.
│   │   ├── services/      # Axios client with JWT refresh interceptors
│   │   └── utils/         # Currency formatting (₹), date helpers, validators
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── SYSTEM_REQUIREMENT_ANALYSIS.md
│   ├── SRS.md
│   ├── API_SPEC.md
│   ├── DATABASE_DESIGN.md
│   └── DEVELOPMENT_PLAN.md
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Apply migrations and seed default categories
python manage.py makemigrations
python manage.py migrate
python manage.py seed_categories

# Run server
python manage.py runserver
```
The backend API will be available at `http://localhost:8000/api/v1/`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The frontend application will be live at `http://localhost:5173`.

---

## 🧪 Testing

Run backend tests with coverage report:
```bash
cd backend
pytest --cov=apps --cov-report=term-missing
```

---

## 📄 License & Documentation
Refer to the comprehensive documentation suite in [`docs/`](./docs) for system requirements, database schema, and full REST API specifications.
