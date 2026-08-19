# Expense Tracker System — System Requirement Analysis

**Document Version:** 1.0  
**Project Name:** Expense Tracker System  
**System Type:** Full-Stack Personal Finance SaaS Web Application  

---

## 1. Introduction & Objectives

The **Expense Tracker System** is designed to provide individuals and small business owners with a centralized, secure, and intuitive web application to track daily income and expenditures, manage custom and default financial categories, plan monthly budgets with utilization tracking, view dynamic analytics through visual dashboards, and generate exportable financial reports (CSV and Excel).

### 1.1 Core Business Goals
1. **Financial Clarity:** Real-time visibility into net balance, monthly burn rate, income streams, and category distribution.
2. **Budget Discipline:** Proactive budget limits per category and month with percentage utilization tracking and visual threshold alerts.
3. **Data Security & Privacy:** Absolute user data isolation, preventing any user from reading, modifying, or deleting another user's financial records.
4. **Actionable Reporting:** Date, category, and type-filtered transaction history with instant export to CSV and Excel formats.

---

## 2. Stakeholders & User Roles

| Role | Responsibilities | Permissions |
|---|---|---|
| **Regular User** | Register, login, manage profile, record income/expenses, create custom categories, configure monthly budgets, analyze dashboard, and export reports. | Read/Write access strictly to self-owned financial records and system default categories. |
| **System Administrator** | Manage system stability, audit system logs, and curate default system categories. | Full access to system administration panel. |

---

## 3. Functional Requirements Overview

### 3.1 Authentication & Profile Management
* **FR-01 (Registration):** Register using unique email, password (strength validated), confirmation password, and name.
* **FR-02 (Login):** Authenticate with email/password; receive short-lived JWT access token and longer-lived refresh token.
* **FR-03 (Token Refresh):** Seamlessly refresh access tokens via Axios interceptors on 401 Unauthorized.
* **FR-04 (Profile & Password):** Retrieve profile, update first/last name, phone number, and change password securely.
* **FR-05 (Logout):** Invalidate tokens on client and clear session state.

### 3.2 Category Management
* **FR-06 (Default Categories):** System-seeded categories available to all users:
  * *Expense:* Food, Travel, Shopping, Rent, Education, Utilities, Others
  * *Income:* Salary, Business, Freelancing, Investment, Other Income
* **FR-07 (Custom Categories):** Users can create, update, and soft-delete/deactivate personal categories.
* **FR-08 (Category Types):** Strict segregation between `EXPENSE` and `INCOME` types.

### 3.3 Expense & Income Tracking
* **FR-09 (Expense CRUD):** Create, retrieve, update, and delete expense records with positive amount, valid category, transaction date, payment method, description, and notes.
* **FR-10 (Income CRUD):** Create, retrieve, update, and delete income records with positive amount, valid category, transaction date, payment method, description, and notes.
* **FR-11 (Filtering & Pagination):** Filter records by date range, category, payment method, and search term with server-side pagination.

### 3.4 Budgeting & Utilization
* **FR-12 (Monthly Budgeting):** Define budget amounts for an expense category for a specific month (1–12) and year.
* **FR-13 (Uniqueness Constraint):** Prevent duplicate budgets for the same `(user, category, month, year)`.
* **FR-14 (Real-time Calculation):** Compute actual expenses, remaining balance, and usage percentage dynamically without storing redundant state.

### 3.5 Dashboard & Visual Analytics
* **FR-15 (KPI Summary):** Real-time calculation of Total Income, Total Expense, Net Balance, and Current Month Expense.
* **FR-16 (Charts & Trends):** Recharts-driven Category Expense Donut Chart, Monthly Income vs. Expense Bar Chart, and Recent Transactions feed.
* **FR-17 (Zero Dashboard Table):** All dashboard metrics derived directly via Django ORM aggregations.

### 3.6 Reports & Data Export
* **FR-18 (Filtered Reports):** Unified report view with Month, Category, and Transaction Type filters.
* **FR-19 (Export):** One-click download of filtered transaction sets to CSV and Excel (`.xlsx`) files.

---

## 4. Non-Functional Requirements

* **Security:** PBKDF2 password hashing, HS256 JWT tokens, CORS origin whitelisting, parameterized SQL via Django ORM, and object-level permission checks on every query.
* **Accuracy:** Strict `DecimalField(12, 2)` for monetary values to eliminate IEEE 754 floating-point drift.
* **Performance:** Sub-200ms REST API response times; database indexes on `(user_id, date)`, `(user_id, category_id)`, and `(user_id, month, year)`.
* **Usability & Design:** Modern, responsive financial SaaS UI (1920px down to 375px) with high-contrast typography, accessible color palettes, skeleton loaders, and clear empty states.
