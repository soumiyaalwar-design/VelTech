# Expense Tracker System — Software Requirements Specification

**Version:** 1.0
**Status:** Development Ready
**System Type:** Full-Stack Web Application

| Layer | Technology |
|---|---|
| Frontend | React.js + Bootstrap |
| Backend | Django + Django REST Framework |
| Database | MySQL |
| API | RESTful API |
| Authentication | JWT |
| Visualization | Recharts / Chart.js |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Scope](#4-scope)
5. [Stakeholders & User Roles](#5-stakeholders--user-roles)
6. [Functional Requirements](#6-functional-requirements)
7. [Business Rules](#7-business-rules)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [System Architecture](#9-system-architecture)
10. [Module Architecture](#10-module-architecture)
11. [Frontend Requirements](#11-frontend-requirements)
12. [Backend Requirements](#12-backend-requirements)
13. [Database Overview](#13-database-overview)
14. [API Overview](#14-api-overview)
15. [Authentication & Authorization](#15-authentication--authorization)
16. [Dashboard & Analytics](#16-dashboard--analytics)
17. [UI/UX Requirements](#17-uiux-requirements)
18. [Error Handling](#18-error-handling)
19. [Security Requirements](#19-security-requirements)
20. [Testing Strategy](#20-testing-strategy)
21. [Performance & Scalability](#21-performance--scalability)
22. [Backup, Recovery & Privacy](#22-backup-recovery--privacy)
23. [Deployment Architecture](#23-deployment-architecture)
24. [MVP Definition](#24-mvp-definition)
25. [Future Enhancements](#25-future-enhancements)
26. [Acceptance Criteria](#26-acceptance-criteria)

---

## 1. Executive Summary

The Expense Tracker System is a secure, responsive, full-stack web application that helps users record, categorize, monitor, and analyze personal income and expenses. React.js drives the presentation layer, Django + DRF power the application/API layer, MySQL provides persistence, JWT handles authentication, Bootstrap delivers a responsive UI, and Recharts/Chart.js render interactive financial visualizations.

The architecture cleanly separates presentation, API communication, authentication, business logic, persistence, and analytics so the system stays maintainable and can grow into a larger personal-finance platform.

## 2. Problem Statement

Manual expense tracking (notebooks, spreadsheets, or basic apps) leads to repetitive data entry, inconsistent categorization, limited reporting, difficult historical comparison, and a lack of secure multi-user access. Users need a centralized system that turns raw transaction records into clear financial information: current balance, income, expenses, category distribution, budget utilization, and spending trends.

## 3. Objectives

- Provide secure user registration, login, logout, and JWT-based authentication.
- Allow users to create, view, update, search, filter, and delete income/expense transactions.
- Provide customizable transaction categories.
- Allow users to define budgets and monitor utilization.
- Provide accurate financial summaries and interactive charts.
- Protect every user's financial data through object-level authorization.
- Provide a responsive, accessible user interface.
- Expose a documented REST API for clean frontend/backend separation.
- Support a scalable database and application design for future extensions.

## 4. Scope

### In Scope
- Authentication and user profile management
- Income and expense transaction management
- Category management (default + custom)
- Budget creation and monitoring
- Dashboard and financial analytics
- Search, sorting, filtering, and pagination
- REST API with JWT authentication/authorization
- Responsive Bootstrap UI with charts
- Validation, error handling, testing, and deployment planning
- In-app notifications (budget alerts, system messages)
- Audit logging of key user/system actions

### Out of Scope (Future)
- Recurring transactions and subscriptions
- Receipt OCR and automatic transaction extraction
- AI-powered categorization and financial assistant
- Bank/account integration
- Expense forecasting and anomaly detection
- Savings goals and investment tracking
- Shared/family accounts
- PDF, Excel, and CSV exports
- Mobile application / PWA

## 5. Stakeholders & User Roles

| Role | Responsibilities |
|---|---|
| Regular User | Manage profile, transactions, categories, budgets, dashboard, and reports |
| Administrator | Manage users, global categories, system settings, and operational issues |
| Developer | Implement, test, maintain, and extend the application |
| Database Administrator | Maintain MySQL integrity, indexes, backups, and recovery |
| Project Guide / Reviewer | Review requirements, architecture, implementation, and testing evidence |

## 6. Functional Requirements

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-01 | Registration | Create account with name, email, password + confirmation; validate uniqueness/format | Critical |
| FR-02 | Login | Authenticate credentials, issue JWT access/refresh tokens | Critical |
| FR-03 | Logout | End session; invalidate/clear client credentials | High |
| FR-04 | Token Refresh | Issue new access token using a valid refresh token | Critical |
| FR-05 | Transaction Create | Create income/expense with amount, category, date, description, payment method | Critical |
| FR-06 | Transaction Update | Edit permitted fields on user-owned transactions | High |
| FR-07 | Transaction Delete | Delete (soft-delete) user-owned transactions | High |
| FR-08 | Search & Filter | Filter by type, category, amount, date, payment method, and text | High |
| FR-09 | Categories | Create/manage custom categories alongside system defaults | High |
| FR-10 | Budgets | Create budgets by category and date range, with alert threshold | High |
| FR-11 | Budget Monitoring | Calculate used, remaining, and utilization percentage | High |
| FR-12 | Dashboard | Display balance, income, expenses, savings, recent transactions | High |
| FR-13 | Analytics | Category, monthly, and income-vs-expense visualizations | High |
| FR-14 | Reports | Daily, weekly, monthly, yearly, and category-level summaries | Medium |
| FR-15 | Insights | Rule-based observations on spending and budget behavior | Medium |
| FR-16 | Notifications | Deliver budget-warning, budget-exceeded, system, and security notices | Medium |
| FR-17 | Audit Logging | Record key account/security/data actions for traceability | Medium |

## 7. Business Rules

- Transaction amount must be greater than zero.
- Income transactions must use income categories; expense transactions must use expense categories.
- A user may access only records they own, unless acting as an authorized administrator.
- Budget amount must be positive; `end_date` cannot precede `start_date`.
- Soft-deleted transactions (`is_deleted = true`) must never appear in normal reports or dashboard totals.
- Monetary values use fixed decimal precision — `DECIMAL(12,2)`, never floating point.
- Analytics must exclude invalid or deleted records.
- Authentication is required for all protected financial operations.
- Categories cannot be hard-deleted while transactions or budgets reference them (`ON DELETE RESTRICT`).

**Core formulas**

```
Balance            = Total Income − Total Expenses
Savings Rate        = ((Income − Expenses) / Income) × 100
Budget Utilization  = (Category Expenses / Category Budget) × 100
Remaining Budget    = Budget Amount − Category Expenses
```

## 8. Non-Functional Requirements

| Attribute | Requirement | Target / Guideline |
|---|---|---|
| Performance | Fast API and dashboard operations | < 500 ms typical API response; < 2 s dashboard load |
| Security | Protect auth and financial data | HTTPS, JWT, password hashing, secure secrets, object-level authorization |
| Scalability | Support growth in users/transactions | Pagination, indexes, optimized queries, modular apps, caching |
| Reliability | Handle failures without corrupting data | DB transactions, validation, backups, graceful error states |
| Maintainability | Modular, testable code | Layered architecture, reusable components, API docs |
| Usability | Simple, intuitive financial workflow | Responsive layouts, clear feedback, accessible controls |
| Accessibility | Keyboard and assistive-tech support | Semantic HTML, labels, focus states, adequate contrast |
| Observability | Detect operational issues | Structured logs, metrics, exception monitoring |

## 9. System Architecture

The system follows a layered client-server model. React never talks to MySQL directly — all business operations flow through authenticated REST APIs.

```
USER / BROWSER
      │
      ▼
┌───────────────────────────┐
│ React.js + Bootstrap       │
│ Pages / Components          │
│ Recharts / Chart.js         │
└──────────────┬──────────────┘
               │ HTTPS / REST
               ▼
┌───────────────────────────┐
│ Django REST Framework       │
│ Authentication (JWT)        │
│ Serializers / Validation    │
│ Permissions / Business logic│
└──────────────┬──────────────┘
               ▼
┌───────────────────────────┐
│ Django ORM                  │
└──────────────┬──────────────┘
               ▼
┌───────────────────────────┐
│ MySQL Database               │
└───────────────────────────┘
```

## 10. Module Architecture

| Module | Responsibilities |
|---|---|
| Accounts | Registration, login, JWT, profile, password management, permissions |
| Transactions | CRUD, search, filtering, sorting, pagination, ownership checks |
| Categories | Default/custom categories and validation |
| Budgets | Budget CRUD, utilization, thresholds, status |
| Analytics | Dashboard metrics, aggregations, monthly trends, category analysis |
| Notifications | Budget alerts, system and security notices, read/unread state |
| Administration | User/system management and operational controls |
| Audit | Immutable log of sensitive/administrative actions |
| Shared / Core | Common utilities, exceptions, permissions, constants, API helpers |

## 11. Frontend Requirements

Recommended React project structure:

```
frontend/
  src/
    assets/
    components/
      Navbar/  Sidebar/  Cards/  Modal/  Loader/  EmptyState/
    pages/
      Login/  Register/  Dashboard/  Transactions/
      Categories/  Budgets/  Reports/  Profile/
    services/
      api.js  authService.js  transactionService.js
      budgetService.js  analyticsService.js
    hooks/
    context/
    routes/
    utils/
    App.jsx
    main.jsx
```

- Use React Router for protected and public routes.
- Centralize the API client (headers, error handling, timeouts, token refresh).
- Use Context API for modest global state; consider Redux Toolkit for complex client state.
- Optionally use TanStack Query for server-state caching, retries, and request lifecycle management.
- Use Bootstrap for responsive grid, forms, cards, modals, navigation, and alerts.

## 12. Backend Requirements

```
backend/
  manage.py
  config/
    settings.py  urls.py  asgi.py  wsgi.py
  apps/
    accounts/  transactions/  categories/
    budgets/   analytics/     notifications/
    audit/
  requirements.txt
  .env
```

- Use DRF serializers for all input/output validation.
- Use ViewSets or class-based API views consistently.
- Use Django permissions for authentication and object-level ownership checks.
- Use `django-filter` for controlled, whitelisted filtering.
- Push aggregation into the database (`annotate`/`aggregate`) wherever practical.
- Keep cross-cutting business rules in a service/domain layer rather than duplicating them across views.

## 13. Database Overview

The system is backed by 6 MySQL tables: `users`, `categories`, `transactions`, `budgets`, `notifications`, and `audit_logs`. Full column definitions, indexes, and foreign keys are documented in **DATABASE_DESIGN.md**.

```
USERS ──< CATEGORIES ──< TRANSACTIONS
  │                          │
  ├──< BUDGETS ──────────────┘  (via category_id)
  ├──< NOTIFICATIONS
  └──< AUDIT_LOGS
```

## 14. API Overview

Base path: `/api/v1/`. Full endpoint list, request/response schemas, and status codes are documented in **API_SPEC.md**.

Standard response envelope:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": { }
}
```

## 15. Authentication & Authorization

```
LOGIN FLOW
User → React → POST credentials → Django
     → validate credentials → issue JWT (access + refresh)
     → React stores session credentials
     → authenticated API requests

REQUEST FLOW
React → Authorization: Bearer <access_token>
      → JWT validation
      → permission / ownership check
      → business logic
      → response
```

- Access tokens are short-lived; refresh tokens may have a longer lifetime.
- Use a secure token storage strategy appropriate to the deployment; avoid exposing long-lived credentials to unnecessary client-side code.
- Implement refresh rotation/revocation where appropriate.
- Every financial object must be filtered by the authenticated user before retrieval or mutation.

## 16. Dashboard & Analytics

```
┌────────────────────────────────────────────────────────────┐
│ Navbar                                                       │
├──────────────┬─────────────────────────────────────────────┤
│ Sidebar       │ Summary Cards: Income | Expense | Balance    │
│               │                                               │
│ Dashboard     │ Income vs Expense Chart                       │
│ Transactions  │                                               │
│ Categories    │ Category Distribution | Budget Utilization    │
│ Budgets       │                                               │
│ Reports       │ Monthly Trend | Recent Transactions            │
│ Profile       │                                               │
└──────────────┴─────────────────────────────────────────────┘
```

| Metric | Calculation |
|---|---|
| Total Income | SUM of valid income transactions |
| Total Expenses | SUM of valid expense transactions |
| Balance | Income − Expenses |
| Category Spending | SUM of expenses grouped by category |
| Savings Rate | ((Income − Expenses) / Income) × 100 |
| Budget Utilization | (Category Expenses / Category Budget) × 100 |
| Remaining Budget | Budget Amount − Category Expenses |

Recommended visualizations: donut/pie (category distribution), bar (income vs. expense), line (monthly trend), horizontal bar (category ranking), progress bars (budget utilization).

## 17. UI/UX Requirements

| Area | Requirement |
|---|---|
| Visual Design | Clean, modern, consistent spacing/typography/hierarchy |
| Responsive | Usable on desktop, tablet, and mobile |
| Forms | Clear labels, validation, hints, loading/error states |
| Navigation | Sidebar on desktop; collapsible/hamburger on smaller screens |
| Tables | Pagination, sorting, filtering, responsive overflow |
| Charts | Responsive, readable, meaningful labels/tooltips |
| Feedback | Success, warning, error, empty, and loading states |
| Accessibility | Semantic HTML, keyboard nav, focus states, contrast |

## 18. Error Handling

| Scenario | Expected Behavior |
|---|---|
| Invalid input | Field-specific validation errors |
| 401 Unauthorized | Attempt token refresh where appropriate; otherwise redirect to login |
| 403 Forbidden | Access-denied message without exposing resource details |
| 404 Not Found | Clear not-found state |
| Network failure | Retry option; preserve unsaved form data where possible |
| DB/service failure | Generic user-safe message; log technical details server-side |
| Empty data | Informative empty state with relevant action |

## 19. Security Requirements

- Hash passwords using Django's secure password hashing mechanism.
- Enforce HTTPS for all production traffic.
- Combine JWT authentication with object-level authorization on every request.
- Store `SECRET_KEY`, DB credentials, JWT settings, and deployment secrets in environment variables — never in source control.
- Configure CORS with an explicit allow-list in production.
- Use the Django ORM / parameterized queries — never concatenated SQL.
- Validate amount, dates, categories, and ownership on every write.
- Apply current security headers and keep dependencies patched.
- Rate-limit authentication endpoints.
- Never expose stack traces, SQL errors, secrets, tokens, or sensitive financial data in production responses/logs.

## 20. Testing Strategy

| Test Level | Coverage |
|---|---|
| Unit | Financial formulas, validators, serializers, services, components, utilities |
| Integration | React ↔ REST API ↔ Django ↔ MySQL workflows |
| API | Authentication, CRUD, filtering, pagination, authorization, error responses |
| UI / E2E | Registration, login, transaction CRUD, budgets, dashboard, navigation |
| Security | JWT failures, cross-user access, injection, XSS, CSRF, rate limiting |
| Performance | Large transaction lists, dashboard aggregation, concurrent requests |

Representative test cases (TC-01 – TC-15) cover registration/duplicate email, login/invalid password, transaction create/validation/edit/delete, cross-user access denial, budget creation and threshold warnings, dashboard accuracy, category filtering, token expiry, and empty states.

## 21. Performance & Scalability

- Index columns aligned with real query patterns (see DATABASE_DESIGN.md).
- Paginate transaction lists; never load all records at once.
- Use `select_related` / `prefetch_related` to avoid N+1 queries.
- Perform aggregations in the database where possible.
- Minimize API payload size; avoid redundant requests.
- Use lazy loading / code splitting on the frontend as the app grows.
- Cache expensive, non-sensitive aggregates selectively.
- Move heavy future work (report generation, notifications) to background tasks.

Example filtering/pagination:
```
GET /api/v1/transactions/?page=1&page_size=20
GET /api/v1/transactions/?type=expense&category=food
GET /api/v1/transactions/?start_date=2026-08-01&end_date=2026-08-31
```

## 22. Backup, Recovery & Privacy

Production requires automated MySQL backups, a defined retention policy, periodic recovery testing, migration backups, and a documented disaster-recovery process. Financial data is treated as confidential: collect only what is required, restrict access by ownership, protect credentials, enforce HTTPS, and support account/data deletion.

## 23. Deployment Architecture

```
INTERNET
    │ HTTPS
    ▼
  NGINX
 ┌────┴─────────────────┐
 │                        │
React static assets   Gunicorn
                          │
                     Django API
                          │
                       MySQL

Optional: Docker + Redis + CI/CD + Monitoring
```

- Serve the React build via Nginx/CDN.
- Run Django behind Gunicorn + Nginx.
- Deploy MySQL with automated backups and restricted network access.
- Use HTTPS certificates and secure headers.
- Use Docker for repeatable dev/deploy environments.
- Use CI/CD to run tests, linting, build, and deployment checks.

## 24. MVP Definition

```
REGISTER → LOGIN → DASHBOARD → ADD INCOME/EXPENSE →
CATEGORIZE → CREATE BUDGET → MONITOR → ANALYZE
```

| Area | MVP Requirement |
|---|---|
| Authentication | Registration, login, JWT, logout |
| Transactions | Create, list, edit, delete, filter |
| Categories | Default + custom |
| Budgets | Create, list, utilization |
| Dashboard | Income, expense, balance, recent transactions |
| Analytics | Category spending, income vs. expense, monthly trend |
| Security | JWT + ownership authorization |
| Testing | Core unit/API/integration tests |

## 25. Future Enhancements

| Feature | Potential Implementation |
|---|---|
| AI Categorization | ML/NLP classifier on transaction descriptions + user feedback |
| Receipt OCR | OCR pipeline extracting merchant, amount, date, category |
| Forecasting | Time-series/statistical models on historical spending |
| Anomaly Detection | IQR, statistical thresholds, or Isolation Forest |
| AI Assistant | Natural-language layer over safe analytics APIs |
| Bank Integration | Secure open-banking integration (region-dependent) |
| Goals | Savings targets, progress tracking, reminders |
| Exports | PDF/CSV/Excel reporting |
| Mobile/PWA | Responsive PWA or React Native client |

## 26. Acceptance Criteria

- A user can register and authenticate successfully.
- JWT-protected APIs reject unauthenticated requests.
- Users cannot retrieve or modify another user's financial records.
- Users can create, edit, search, filter, and delete income/expense transactions.
- Categories are validated against transaction type.
- Budget utilization is calculated accurately.
- Dashboard totals match underlying transaction data.
- Charts represent the same values returned by analytics APIs.
- Invalid input is rejected with useful, field-level error messages.
- REST endpoints follow documented methods and status codes.
- MySQL maintains foreign-key and monetary data integrity.
- The application is usable on desktop, tablet, and mobile.
- Core automated tests pass before release.