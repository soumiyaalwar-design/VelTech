# Expense Tracker System — Development Plan

**Stack:** React.js + Bootstrap · Django + DRF · MySQL · JWT · Recharts/Chart.js
**Reference documents:** `SRS.md`, `DATABASE_DESIGN.md`, `API_SPEC.md`

---

## 1. Development Approach

Iterative, module-by-module delivery aligned to the MVP path defined in the SRS:

```
REGISTER → LOGIN → DASHBOARD → ADD INCOME/EXPENSE →
CATEGORIZE → CREATE BUDGET → MONITOR → ANALYZE
```

Backend and frontend for a given module are built together in the same sprint so each phase ends with a demoable, working slice rather than a disconnected layer.

## 2. Git Strategy

```
main
 └── develop
      ├── feature/authentication
      ├── feature/transactions
      ├── feature/categories
      ├── feature/budgets
      ├── feature/analytics
      ├── feature/notifications
      └── feature/frontend-dashboard
```

- `main` — production-ready, tagged releases only.
- `develop` — integration branch; all feature branches merge here via PR.
- One feature branch per module; small, reviewable PRs.
- Required before merge: passing tests, lint clean.
  - **If working with a team:** at least one peer review/approval on the PR before merging to `develop`.
  - **If working solo (default for this project):** a self-review pass using a short checklist in the PR description — what changed, what was tested, any known trade-offs — before merging. This keeps a paper trail without requiring a second reviewer that doesn't exist.
- Keep `.env`, `.venv`, `node_modules/`, build artifacts, and credentials out of Git (`.gitignore` from day one).
- Use meaningful, conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).

## 3. Environment Setup (Phase 0)

**Backend**
```bash
python -m venv venv
source venv/bin/activate
pip install django djangorestframework djangorestframework-simplejwt \
            mysqlclient django-filter django-cors-headers python-dotenv
django-admin startproject config .
python manage.py startapp accounts
python manage.py startapp transactions
python manage.py startapp categories
python manage.py startapp budgets
python manage.py startapp analytics
python manage.py startapp notifications
python manage.py startapp audit
```

**Frontend**
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom axios bootstrap recharts
```

**Database**
```sql
CREATE DATABASE expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Apply the schema in `DATABASE_DESIGN.md` via Django migrations (`makemigrations` / `migrate`) once models are defined, or import the MySQL Workbench forward-engineered SQL directly for the initial baseline.

Deliverables: repo initialized, branch structure created, `.env.example` committed, base Django project + React app boot successfully, MySQL connection verified.

---

## 4. Phased Delivery Plan

### Phase 1 — Foundation & Authentication (Week 1–2)
**Branch:** `feature/authentication`

Backend:
- Custom Django user model on `email` (maps to `users` table); migrations for `users`.
- `POST /auth/register/`, `POST /auth/login/`, `POST /auth/token/refresh/`, `POST /auth/logout/`, `GET/PATCH /auth/me/`, `POST /auth/change-password/`.
- `djangorestframework-simplejwt` configuration (access/refresh lifetimes, rotation).
- Global exception handler → standard response envelope.
- Seed migration for default `categories` (`is_default=1`, `user_id=NULL`).

Frontend:
- `Login`, `Register` pages; `authService.js`; centralized Axios client with interceptor for token attach + refresh-on-401.
- `AuthContext` + protected route wrapper.
- Base app shell: `Navbar`, `Sidebar`, routing skeleton.

**Exit criteria:** a user can register, log in, stay authenticated across a refresh, and log out; unauthenticated requests to any protected endpoint return `401`.

---

### Phase 2 — Categories & Transactions (Week 3–4)
**Branch:** `feature/categories`, `feature/transactions`

Backend:
- `categories` app: model, serializer, ViewSet, ownership + default-visibility logic, `is_active` deactivation instead of hard delete.
- `transactions` app: model with `chk_transactions_amount` validation, serializer enforcing `category.type == transaction_type`, soft-delete (`is_deleted`) on `DELETE`.
- `django-filter` FilterSet for type, category, date range, amount range, payment method; `search` param over description/notes.
- Pagination (page/page_size) on list endpoints.
- Object-level permission class enforcing `queryset.filter(user=request.user)` on every view.

Frontend:
- `Categories` page: list, create, edit, deactivate.
- `Transactions` page: list with filters/search/sort/pagination, create/edit modal, delete with confirmation.
- `transactionService.js`, reusable `Cards`, `Modal`, `EmptyState`, `Loader` components.

**Exit criteria:** full transaction CRUD works end-to-end with correct ownership isolation (TC-05–TC-09 from SRS pass); categories validate against transaction type.

---

### Phase 3 — Budgets & Notifications (Week 5)
**Branch:** `feature/budgets`, `feature/notifications`

Backend:
- `budgets` app: model with `chk_budgets_amount` / `chk_budgets_dates`, serializer, ViewSet.
- Utilization calculation (spent / remaining / percentage / status) computed server-side per `DATABASE_DESIGN.md` §6, exposed on `GET /budgets/{id}/` and list.
- `notifications` app: model, list/unread-count/mark-read/mark-all-read endpoints.
- Background/synchronous check (management command or Celery task, environment-dependent) that evaluates `alert_percentage` against current spend and inserts `BUDGET_WARNING` / `BUDGET_EXCEEDED` notifications.

Frontend:
- `Budgets` page: create by category/date range, progress bars for utilization, status badges (on track / warning / exceeded).
- Notification bell/dropdown with unread badge, mark-as-read interactions.

**Exit criteria:** creating a budget and adding matching expense transactions correctly moves utilization and triggers a notification at the configured threshold (TC-10, TC-11).

---

### Phase 4 — Dashboard & Analytics (Week 6)
**Branch:** `feature/analytics`, `feature/frontend-dashboard`

Backend:
- `analytics` app (read-only ViewSets/APIViews): `summary`, `monthly`, `categories`, `income-expense`, `budget-status`.
- All aggregation done via Django ORM `annotate`/`aggregate`, filtered by `user`, excluding `is_deleted=1`.

Frontend:
- `Dashboard` page: summary cards (income/expense/balance), income-vs-expense bar chart, category donut chart, monthly trend line chart, budget-utilization progress bars, recent transactions list — using Recharts/Chart.js.
- `analyticsService.js`.

**Exit criteria:** dashboard totals match direct DB queries; charts reflect the same values as the analytics endpoints (TC-12).

---

### Phase 5 — Reports, Admin & Audit (Week 7)
- Reports page: daily/weekly/monthly/yearly and category-level summaries built on the analytics endpoints (date-range driven).
- Admin endpoints: user list/activate-deactivate, default category management, audit log viewer.
- `audit` app: middleware or signal-based logging of sensitive actions (login, password change, transaction delete, admin actions) into `audit_logs`.

**Exit criteria:** admin can view users and audit trail; sensitive actions are logged with `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`.

---

### Phase 6 — Hardening, Testing & Deployment (Week 8)
- Security pass: CORS allow-list, security headers, rate limiting on auth endpoints, secret rotation, dependency audit.
- Test suite completion (see §5 below) — target meaningful coverage on formulas, serializers, permissions, and critical UI flows.
- Performance pass: verify indexes against real query plans (`EXPLAIN`), add `select_related`/`prefetch_related` where needed, confirm pagination on every list endpoint.
- Dockerize backend + frontend; Nginx reverse proxy config; Gunicorn WSGI config.
- CI/CD pipeline (GitHub Actions): lint → test → build → (optional) deploy.
- Production deployment: MySQL with automated backups, HTTPS certificates, environment-variable secrets.

**Exit criteria:** all items in SRS §26 (Acceptance Criteria) verified; core automated test suite passing in CI.

---

## 5. Testing Plan (mapped to SRS §20)

| Level | Scope | Tooling |
|---|---|---|
| Unit | Financial formulas (balance, savings rate, utilization), serializers, validators, service functions | Pytest / Django Test Framework |
| Unit (frontend) | Components, hooks, utils | Jest / Vitest + React Testing Library |
| Integration | React ↔ API ↔ Django ↔ MySQL workflows | Pytest + test DB |
| API | Auth, CRUD, filtering, pagination, authorization, error shapes | DRF `APITestCase` |
| E2E | Register → login → transaction CRUD → budget → dashboard | Cypress / Playwright (optional) |
| Security | Cross-user access, JWT expiry/tampering, injection, rate limiting | Pytest + manual review |

Representative cases to automate first: TC-01/02 (registration + duplicate email), TC-03/04 (login), TC-05/06 (transaction create + negative amount rejection), TC-09 (cross-user access denial), TC-10/11 (budget creation + exceed warning), TC-12 (dashboard accuracy).

## 6. Milestones Summary

| Phase | Weeks | Key Deliverable |
|---|---|---|
| 0 — Setup | Pre-week 1 | Repos, environments, DB created |
| 1 — Auth | 1–2 | Working login/register/JWT flow |
| 2 — Categories & Transactions | 3–4 | Full transaction CRUD with filters |
| 3 — Budgets & Notifications | 5 | Budget tracking + alerts |
| 4 — Dashboard & Analytics | 6 | Charts and summary metrics |
| 5 — Reports & Admin | 7 | Reports, admin console, audit trail |
| 6 — Hardening & Deployment | 8 | Tested, dockerized, deployed MVP |

## 7. Risk Notes

- **Category deletion conflicts** (`ON DELETE RESTRICT`): must be handled in UX as "deactivate," not "delete," to avoid confusing `409` errors — flag early with frontend team (or self, if solo).
- **Decimal precision**: always serialize/deserialize `amount` fields as strings or `Decimal`, never native floats, on both backend and frontend, to avoid rounding drift against `DECIMAL(12,2)`.
- **Token storage**: decide early (memory + refresh vs. httpOnly cookie) since it affects the Axios interceptor design in Phase 1.
- **Budget alert job**: needs a scheduling mechanism (cron/Celery/management command) — decide in Phase 3 based on deployment environment constraints.