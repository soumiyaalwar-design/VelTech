# Expense Tracker — Frontend

A modern, high-performance financial SaaS interface built with **React 18**, **Vite**, **React Router v6**, **Recharts**, **Lucide Icons**, and **Axios**.

## Architecture & Features

- **Authentication & Interceptors**: Custom Axios instance with Bearer token injection, automatic 401 refresh token flow, and persistent session state.
- **Design System**: Dark-mode SaaS UI inspired by Stripe and Linear with custom CSS custom properties, responsive grids, and micro-animations.
- **Data Visualizations**: Recharts donut chart for category distribution and responsive dual-bar charts for 6-month financial trends.
- **Complete Suite of Pages**:
  1. `Login` — Split-screen branding, field validations, show/hide password toggle.
  2. `Register` — Split-screen branding, real-time password strength meter, password confirmation matching.
  3. `Dashboard` — Real-time KPI stat cards, monthly savings rate, charts, active budgets, recent transactions feed.
  4. `Expenses` — Full CRUD, filters (search, category, payment method, date range), INR currency formatting, modals.
  5. `Income` — Full CRUD, revenue stream tracking, filters, modals.
  6. `Categories` — Tabbed Expense/Income management, Default system category protection, custom category creator with color picker.
  7. `Budgets` — Monthly category spending limits, real-time utilization progress bars, threshold warning indicators.
  8. `Reports` — Consolidated statement, month/year/type filtering, single-click CSV and Excel export triggers.
  9. `Profile` — User account details editing and secure password changing.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

Runs the application locally at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Outputs optimized static assets to `dist/`.
