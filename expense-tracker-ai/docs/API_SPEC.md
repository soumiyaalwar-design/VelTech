# Expense Tracker System — REST API Specification

**Base URL:** `/api/v1/`
**Format:** JSON
**Authentication:** JWT (Bearer token), via `Authorization: Bearer <access_token>`

---

## 1. Conventions

### 1.1 Standard Response Envelope

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": { }
}
```

Error responses follow the same envelope with `success: false` and a `errors` object for field-level validation issues:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "amount": ["Amount must be greater than zero."]
  }
}
```

### 1.2 Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | No content / successful delete |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Validation error |
| 429 | Too many requests |
| 500 | Internal server error |

### 1.3 Pagination

List endpoints are paginated by default:

```
GET /transactions/?page=1&page_size=20
```

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "count": 143,
    "next": "/api/v1/transactions/?page=2&page_size=20",
    "previous": null,
    "results": [ ]
  }
}
```

### 1.4 Auth Header

All endpoints marked **JWT** require:
```
Authorization: Bearer <access_token>
```

---

## 2. Authentication Endpoints

### `POST /auth/register/`
**Auth:** Public

Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!",
  "first_name": "Soumi",
  "last_name": "A"
}
```

Response `201`:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Soumi",
    "last_name": "A"
  }
}
```

Validation: email uniqueness, email format, password strength, `password == confirm_password`.

---

### `POST /auth/login/`
**Auth:** Public

Request:
```json
{ "email": "user@example.com", "password": "StrongPass123!" }
```

Response `200`:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access": "<jwt-access-token>",
    "refresh": "<jwt-refresh-token>",
    "user": { "id": 1, "email": "user@example.com", "first_name": "Soumi" }
  }
}
```

---

### `POST /auth/token/refresh/`
**Auth:** Refresh token

Request:
```json
{ "refresh": "<jwt-refresh-token>" }
```

Response `200`:
```json
{ "success": true, "message": "Token refreshed", "data": { "access": "<new-jwt-access-token>" } }
```

---

### `POST /auth/logout/`
**Auth:** JWT

Request:
```json
{ "refresh": "<jwt-refresh-token>" }
```
Response `204` — refresh token blacklisted/revoked where supported.

---

### `GET /auth/me/`
**Auth:** JWT

Response `200`:
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Soumi",
    "last_name": "A",
    "phone": null,
    "profile_image": null,
    "is_active": true,
    "created_at": "2026-01-10T09:00:00Z"
  }
}
```

### `PATCH /auth/me/`
**Auth:** JWT — update profile fields (`first_name`, `last_name`, `phone`, `profile_image`).

### `POST /auth/change-password/`
**Auth:** JWT

Request: `{ "old_password": "...", "new_password": "...", "confirm_new_password": "..." }`

---

## 3. Transactions

Maps to the `transactions` table.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/transactions/` | List transactions (filtered, paginated) | JWT |
| POST | `/transactions/` | Create transaction | JWT |
| GET | `/transactions/{id}/` | Retrieve transaction | JWT |
| PATCH | `/transactions/{id}/` | Update transaction | JWT |
| DELETE | `/transactions/{id}/` | Soft-delete transaction | JWT |

### Query Parameters — `GET /transactions/`

| Param | Type | Example |
|---|---|---|
| `type` | `INCOME` \| `EXPENSE` | `?type=expense` |
| `category` | category id | `?category=4` |
| `payment_method` | enum | `?payment_method=UPI` |
| `start_date` / `end_date` | `YYYY-MM-DD` | `?start_date=2026-08-01&end_date=2026-08-31` |
| `min_amount` / `max_amount` | decimal | `?min_amount=100&max_amount=5000` |
| `search` | text (matches description/notes) | `?search=grocery` |
| `ordering` | field, prefix `-` for desc | `?ordering=-transaction_date` |
| `page`, `page_size` | int | `?page=2&page_size=20` |

### Object Schema

```json
{
  "id": 101,
  "user_id": 1,
  "category": { "id": 4, "name": "Groceries", "type": "EXPENSE", "icon": "cart", "color": "#F97316" },
  "transaction_type": "EXPENSE",
  "amount": "1250.50",
  "description": "Weekly groceries",
  "transaction_date": "2026-08-15",
  "payment_method": "UPI",
  "notes": null,
  "is_deleted": false,
  "created_at": "2026-08-15T10:22:00Z",
  "updated_at": "2026-08-15T10:22:00Z"
}
```

### `POST /transactions/` — Request

```json
{
  "category_id": 4,
  "transaction_type": "EXPENSE",
  "amount": 1250.50,
  "description": "Weekly groceries",
  "transaction_date": "2026-08-15",
  "payment_method": "UPI",
  "notes": null
}
```

**Validation rules:**
- `amount` must be `> 0` (maps to `chk_transactions_amount`).
- `category_id` must belong to the authenticated user or be a system default, and its `type` must match `transaction_type`.
- `transaction_date` must be a valid date (not required to be in the past, but application may cap future-dating).
- Response `201` returns the created object; `422` on validation failure.

### `DELETE /transactions/{id}/`
Performs a **soft delete** (`is_deleted = 1`) rather than a hard row delete, per business rules. Returns `204`. Soft-deleted rows are excluded from list/analytics endpoints by default.

---

## 4. Categories

Maps to the `categories` table.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/categories/` | List categories (own + system defaults) | JWT |
| POST | `/categories/` | Create custom category | JWT |
| GET | `/categories/{id}/` | Retrieve category | JWT |
| PATCH | `/categories/{id}/` | Update own category | JWT |
| DELETE | `/categories/{id}/` | Deactivate category | JWT |

### Query Parameters
`?type=INCOME|EXPENSE` · `?is_active=true`

### Object Schema

```json
{
  "id": 4,
  "user_id": null,
  "name": "Groceries",
  "type": "EXPENSE",
  "icon": "cart",
  "color": "#F97316",
  "description": "Household grocery spend",
  "is_default": true,
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

`POST /categories/` request:
```json
{ "name": "Side Hustle", "type": "INCOME", "icon": "briefcase", "color": "#22C55E", "description": null }
```

**Note (updated):** `DELETE /categories/{id}/` never performs a hard row delete. It always sets `is_active = 0` (soft-deactivation) and returns `204`. This is intentional and matches the DB layer, where `ON DELETE RESTRICT` would reject a hard delete on any category still referenced by a transaction or budget. Deactivated categories:
- Are excluded from default category pickers in the UI (`?is_active=true` filter).
- Remain valid on existing historical transactions/budgets (nothing is orphaned).
- Cannot be reactivated by a plain `PATCH` from a non-owner; only the owning user (or an admin, for system defaults) may set `is_active` back to `1`.

There is no separate hard-delete endpoint in this API version.

---

## 5. Budgets

Maps to the `budgets` table.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/budgets/` | List budgets | JWT |
| POST | `/budgets/` | Create budget | JWT |
| GET | `/budgets/{id}/` | Retrieve budget (with utilization) | JWT |
| PATCH | `/budgets/{id}/` | Update budget | JWT |
| DELETE | `/budgets/{id}/` | Delete budget | JWT |

### Object Schema (includes computed fields)

```json
{
  "id": 12,
  "category": { "id": 4, "name": "Groceries", "type": "EXPENSE" },
  "amount": "10000.00",
  "start_date": "2026-08-01",
  "end_date": "2026-08-31",
  "alert_percentage": "80.00",
  "spent": "6420.00",
  "remaining": "3580.00",
  "utilization_percentage": 64.20,
  "status": "ON_TRACK",
  "created_at": "2026-08-01T08:00:00Z"
}
```

`status` is computed: `ON_TRACK` (< alert_percentage), `WARNING` (≥ alert_percentage, < 100%), `EXCEEDED` (≥ 100%).

`POST /budgets/` request:
```json
{
  "category_id": 4,
  "amount": 10000.00,
  "start_date": "2026-08-01",
  "end_date": "2026-08-31",
  "alert_percentage": 80.00
}
```

**Validation rules:**
- `amount > 0` (`chk_budgets_amount`).
- `end_date >= start_date` (`chk_budgets_dates`).
- `category_id` **must** resolve to a category with `type = EXPENSE`. This is not enforced by the database (MySQL cannot express a cross-table `CHECK`) — the serializer must validate it explicitly and return `422` on mismatch:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "category_id": ["Budgets can only be created for EXPENSE categories."] }
}
```

---

## 6. Analytics

Read-only, aggregation endpoints over `transactions`/`budgets`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/analytics/summary/` | Dashboard summary | JWT |
| GET | `/analytics/monthly/` | Monthly income/expense trend | JWT |
| GET | `/analytics/categories/` | Spending by category | JWT |
| GET | `/analytics/income-expense/` | Income vs. expense totals | JWT |
| GET | `/analytics/budget-status/` | Budget utilization across active budgets | JWT |

### `GET /analytics/summary/`
Query: `?start_date=&end_date=` (optional; defaults to current month)

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "total_income": "45000.00",
    "total_expenses": "28450.00",
    "balance": "16550.00",
    "savings_rate": 36.78,
    "recent_transactions": [ ]
  }
}
```

### `GET /analytics/monthly/`
Query: `?months=6`
```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "month": "2026-03", "income": "42000.00", "expenses": "31000.00" },
    { "month": "2026-04", "income": "43500.00", "expenses": "27800.00" }
  ]
}
```

### `GET /analytics/categories/`
Query: `?type=EXPENSE&start_date=&end_date=`
```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "category_id": 4, "category_name": "Groceries", "total": "6420.00", "percentage": 22.6 },
    { "category_id": 7, "category_name": "Rent", "total": "12000.00", "percentage": 42.2 }
  ]
}
```

### `GET /analytics/income-expense/`
```json
{ "success": true, "message": "OK", "data": { "income": "45000.00", "expenses": "28450.00" } }
```

### `GET /analytics/budget-status/`
```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "budget_id": 12, "category_name": "Groceries", "utilization_percentage": 64.2, "status": "ON_TRACK" },
    { "budget_id": 13, "category_name": "Dining Out", "utilization_percentage": 92.5, "status": "WARNING" }
  ]
}
```

All analytics endpoints **must** exclude `is_deleted = 1` transactions and filter strictly by the authenticated `user_id`.

---

## 7. Notifications

Maps to the `notifications` table.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/notifications/` | List notifications (paginated) | JWT |
| GET | `/notifications/unread-count/` | Count of unread notifications | JWT |
| PATCH | `/notifications/{id}/` | Mark as read (`is_read: true`) | JWT |
| PATCH | `/notifications/mark-all-read/` | Mark all as read | JWT |
| DELETE | `/notifications/{id}/` | Delete a notification | JWT |

### Object Schema
```json
{
  "id": 55,
  "title": "Budget nearing limit",
  "message": "You've used 85% of your Groceries budget for August.",
  "notification_type": "BUDGET_WARNING",
  "is_read": false,
  "created_at": "2026-08-16T07:00:00Z"
}
```

`notification_type` values: `BUDGET_WARNING`, `BUDGET_EXCEEDED`, `SYSTEM`, `SECURITY`, `GENERAL`.

---

## 8. Administration (Admin-only, `is_admin = 1`)

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/admin/users/` | List all users | JWT + Admin |
| PATCH | `/admin/users/{id}/` | Activate/deactivate a user | JWT + Admin |
| GET | `/admin/categories/` | Manage system default categories | JWT + Admin |
| GET | `/admin/audit-logs/` | Query audit trail | JWT + Admin |

### `GET /admin/audit-logs/`
Query: `?user_id=&action=&entity_type=&start_date=&end_date=`
```json
{
  "id": 900,
  "user_id": 1,
  "action": "TRANSACTION_DELETE",
  "entity_type": "transaction",
  "entity_id": 101,
  "description": "User soft-deleted transaction #101",
  "ip_address": "203.0.113.7",
  "created_at": "2026-08-15T11:00:00Z"
}
```

---

## 9. Error Response Examples

**401 — missing/expired token**
```json
{ "success": false, "message": "Authentication credentials were not provided.", "errors": null }
```

**403 — accessing another user's transaction**
```json
{ "success": false, "message": "You do not have permission to perform this action.", "errors": null }
```

**422 — validation error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "amount": ["Amount must be greater than zero."],
    "end_date": ["end_date cannot be earlier than start_date."]
  }
}
```

---

## 10. Endpoint Summary Table

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/register/` | Create account | Public |
| POST | `/auth/login/` | Authenticate | Public |
| POST | `/auth/token/refresh/` | Refresh access token | Refresh token |
| POST | `/auth/logout/` | End session | JWT |
| GET/PATCH | `/auth/me/` | Current user profile | JWT |
| POST | `/auth/change-password/` | Change password | JWT |
| GET/POST | `/transactions/` | List / create transactions | JWT |
| GET/PATCH/DELETE | `/transactions/{id}/` | Retrieve / update / delete | JWT |
| GET/POST | `/categories/` | List / create categories | JWT |
| GET/PATCH/DELETE | `/categories/{id}/` | Retrieve / update / deactivate | JWT |
| GET/POST | `/budgets/` | List / create budgets | JWT |
| GET/PATCH/DELETE | `/budgets/{id}/` | Retrieve / update / delete | JWT |
| GET | `/analytics/summary/` | Dashboard summary | JWT |
| GET | `/analytics/monthly/` | Monthly trend | JWT |
| GET | `/analytics/categories/` | Category spending | JWT |
| GET | `/analytics/income-expense/` | Income vs. expense | JWT |
| GET | `/analytics/budget-status/` | Budget utilization | JWT |
| GET | `/notifications/` | List notifications | JWT |
| GET | `/notifications/unread-count/` | Unread count | JWT |
| PATCH | `/notifications/{id}/` | Mark read | JWT |
| PATCH | `/notifications/mark-all-read/` | Mark all read | JWT |
| DELETE | `/notifications/{id}/` | Delete notification | JWT |
| GET | `/admin/users/` | List users | JWT + Admin |
| PATCH | `/admin/users/{id}/` | Activate/deactivate user | JWT + Admin |
| GET | `/admin/audit-logs/` | Query audit trail | JWT + Admin |