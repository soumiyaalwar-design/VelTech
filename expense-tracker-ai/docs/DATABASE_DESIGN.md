# Expense Tracker System — Database Design

**Database Engine:** MySQL 8.x
**Schema Name:** `expense_tracker`
**Source:** Reverse-engineered from `expense-tracker-system.mwb` (MySQL Workbench model)

---

## 1. Entity Relationship Overview

```
                 ┌───────────┐
                 │   USERS    │
                 └─────┬──────┘
       ┌───────────────┼───────────────┬────────────────┐
       │               │               │                │
       ▼               ▼               ▼                ▼
┌────────────┐  ┌──────────────┐ ┌────────────┐ ┌────────────────┐
│ CATEGORIES │  │ TRANSACTIONS  │ │  BUDGETS    │ │ NOTIFICATIONS   │
└─────┬──────┘  └──────┬───────┘ └─────┬──────┘ └────────────────┘
      │                │                │
      └───────>────────┴───────<────────┘
        (category_id FK on both transactions & budgets)

USERS ──< AUDIT_LOGS   (user_id nullable, SET NULL on user delete)
```

Six tables in total: **users, categories, transactions, budgets, notifications, audit_logs**.

---

## 2. Table Definitions

### 2.1 `users`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NULL |
| phone | VARCHAR(20) | NULL |
| profile_image | VARCHAR(500) | NULL |
| is_active | TINYINT(1) | NOT NULL, DEFAULT 1 |
| is_admin | TINYINT(1) | NOT NULL, DEFAULT 0 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**Indexes:** `PRIMARY (id)` · `UNIQUE email` · `idx_users_email (email)` · `idx_users_active (is_active)`

```sql
CREATE TABLE users (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(255)  NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  first_name      VARCHAR(100)  NOT NULL,
  last_name       VARCHAR(100)  NULL,
  phone           VARCHAR(20)   NULL,
  profile_image   VARCHAR(500)  NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  is_admin        TINYINT(1)    NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY idx_users_email (email),
  KEY idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 2.2 `categories`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | BIGINT | FK → users.id, NULL (NULL = system default category) |
| name | VARCHAR(100) | NOT NULL |
| type | ENUM('INCOME','EXPENSE') | NOT NULL |
| icon | VARCHAR(100) | NULL |
| color | VARCHAR(20) | NULL |
| description | VARCHAR(255) | NULL |
| is_default | TINYINT(1) | NOT NULL, DEFAULT 0 |
| is_active | TINYINT(1) | NOT NULL, DEFAULT 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**Indexes:** `PRIMARY (id)` · `idx_categories_user (user_id)` · `idx_categories_type (type)` · `idx_categories_user_type (user_id, type)` · `UNIQUE uq_categories_user_name_type (user_id, name, type)`

**Foreign Keys:** `fk_categories_user`: `user_id → users.id`, `ON DELETE CASCADE`

```sql
CREATE TABLE categories (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NULL,
  name         VARCHAR(100) NOT NULL,
  type         ENUM('INCOME','EXPENSE') NOT NULL,
  icon         VARCHAR(100) NULL,
  color        VARCHAR(20)  NULL,
  description  VARCHAR(255) NULL,
  is_default   TINYINT(1)   NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_categories_user (user_id),
  KEY idx_categories_type (type),
  KEY idx_categories_user_type (user_id, type),
  UNIQUE KEY uq_categories_user_name_type (user_id, name, type),
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> **Change note:** Added `uq_categories_user_name_type` so a given user (or the system, for `user_id IS NULL` defaults) cannot create two categories with the same `name` + `type` — prevents duplicate/confusing categories like two separate "Groceries / EXPENSE" rows for the same user.

> Note: `user_id NULL` distinguishes **system default categories** (visible to all users) from **user-created custom categories**. Application logic should query `WHERE user_id = :current_user OR user_id IS NULL`.

> **Change note — budget/category type consistency:** MySQL cannot express a cross-table `CHECK` (e.g. "a budget's category must have `type = EXPENSE`") natively. This rule is **enforced at the application layer only** (DRF serializer validation on `budgets`, see API_SPEC.md §5) — not guaranteed by the schema itself. If stricter DB-level enforcement is required, add a `BEFORE INSERT`/`BEFORE UPDATE` trigger on `budgets` that looks up `categories.type` and raises `SIGNAL SQLSTATE '45000'` when it isn't `EXPENSE`.

---

### 2.3 `transactions`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | BIGINT | FK → users.id, NOT NULL |
| category_id | BIGINT | FK → categories.id, NOT NULL |
| transaction_type | ENUM('INCOME','EXPENSE') | NOT NULL |
| amount | DECIMAL(12,2) | NOT NULL |
| description | VARCHAR(255) | NULL |
| transaction_date | DATE | NOT NULL |
| payment_method | ENUM('CASH','CARD','UPI','BANK_TRANSFER','WALLET','OTHER') | NOT NULL, DEFAULT 'OTHER' |
| notes | TEXT | NULL |
| is_deleted | TINYINT(1) | NOT NULL, DEFAULT 0 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**Indexes:** `PRIMARY (id)` · `idx_transactions_user (user_id)` · `idx_transactions_category (category_id)` · `idx_transactions_date (transaction_date)` · `idx_transactions_type (transaction_type)` · `idx_transactions_user_date (user_id, transaction_date)` · `idx_transactions_user_type (user_id, transaction_type)` · `idx_transactions_user_category (user_id, category_id)`

**Foreign Keys:**
- `fk_transactions_user`: `user_id → users.id`, `ON DELETE CASCADE`
- `fk_transactions_category`: `category_id → categories.id`, `ON DELETE RESTRICT`

```sql
CREATE TABLE transactions (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id            BIGINT UNSIGNED NOT NULL,
  category_id        BIGINT UNSIGNED NOT NULL,
  transaction_type   ENUM('INCOME','EXPENSE') NOT NULL,
  amount             DECIMAL(12,2) NOT NULL,
  description        VARCHAR(255) NULL,
  transaction_date   DATE NOT NULL,
  payment_method     ENUM('CASH','CARD','UPI','BANK_TRANSFER','WALLET','OTHER') NOT NULL DEFAULT 'OTHER',
  notes              TEXT NULL,
  is_deleted         TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_transactions_user (user_id),
  KEY idx_transactions_category (category_id),
  KEY idx_transactions_date (transaction_date),
  KEY idx_transactions_type (transaction_type),
  KEY idx_transactions_user_date (user_id, transaction_date),
  KEY idx_transactions_user_type (user_id, transaction_type),
  KEY idx_transactions_user_category (user_id, category_id),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT chk_transactions_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> `ON DELETE RESTRICT` on `category_id` prevents deleting a category that still has transactions attached — enforce soft-deactivation (`is_active = 0`) instead of hard delete at the application layer.

---

### 2.4 `budgets`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | BIGINT | FK → users.id, NOT NULL |
| category_id | BIGINT | FK → categories.id, NOT NULL |
| amount | DECIMAL(12,2) | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| alert_percentage | DECIMAL(5,2) | NOT NULL, DEFAULT 80.00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**Indexes:** `PRIMARY (id)` · `idx_budgets_user (user_id)` · `idx_budgets_category (category_id)` · `idx_budgets_dates (start_date, end_date)` · `idx_budgets_user_dates (user_id, start_date, end_date)`

**Foreign Keys:**
- `fk_budgets_user`: `user_id → users.id`, `ON DELETE CASCADE`
- `fk_budgets_category`: `category_id → categories.id`, `ON DELETE RESTRICT`

```sql
CREATE TABLE budgets (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id            BIGINT UNSIGNED NOT NULL,
  category_id        BIGINT UNSIGNED NOT NULL,
  amount             DECIMAL(12,2) NOT NULL,
  start_date         DATE NOT NULL,
  end_date           DATE NOT NULL,
  alert_percentage   DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_budgets_user (user_id),
  KEY idx_budgets_category (category_id),
  KEY idx_budgets_dates (start_date, end_date),
  KEY idx_budgets_user_dates (user_id, start_date, end_date),
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT chk_budgets_amount CHECK (amount > 0),
  CONSTRAINT chk_budgets_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 2.5 `notifications`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | BIGINT | FK → users.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| message | TEXT | NOT NULL |
| notification_type | ENUM('BUDGET_WARNING','BUDGET_EXCEEDED','SYSTEM','SECURITY','GENERAL') | NOT NULL, DEFAULT 'GENERAL' |
| is_read | TINYINT(1) | NOT NULL, DEFAULT 0 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Indexes:** `PRIMARY (id)` · `idx_notifications_user (user_id)` · `idx_notifications_read (is_read)` · `idx_notifications_user_read (user_id, is_read)`

**Foreign Keys:** `fk_notifications_user`: `user_id → users.id`, `ON DELETE CASCADE`

```sql
CREATE TABLE notifications (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id              BIGINT UNSIGNED NOT NULL,
  title                VARCHAR(255) NOT NULL,
  message              TEXT NOT NULL,
  notification_type    ENUM('BUDGET_WARNING','BUDGET_EXCEEDED','SYSTEM','SECURITY','GENERAL') NOT NULL DEFAULT 'GENERAL',
  is_read              TINYINT(1) NOT NULL DEFAULT 0,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id),
  KEY idx_notifications_read (is_read),
  KEY idx_notifications_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 2.6 `audit_logs`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| user_id | BIGINT | FK → users.id, NULL |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(100) | NULL |
| entity_id | BIGINT | NULL |
| description | TEXT | NULL |
| ip_address | VARCHAR(45) | NULL |
| user_agent | VARCHAR(500) | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Indexes:** `PRIMARY (id)` · `idx_audit_user (user_id)` · `idx_audit_action (action)` · `idx_audit_entity (entity_type, entity_id)` · `idx_audit_created (created_at)`

**Foreign Keys:** `fk_audit_user`: `user_id → users.id`, `ON DELETE SET NULL`

```sql
CREATE TABLE audit_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NULL,
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(100) NULL,
  entity_id     BIGINT NULL,
  description   TEXT NULL,
  ip_address    VARCHAR(45) NULL,
  user_agent    VARCHAR(500) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_user (user_id),
  KEY idx_audit_action (action),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Foreign Key & Deletion Behavior Summary

| Child Table | FK Column | References | On Delete |
|---|---|---|---|
| categories | user_id | users.id | CASCADE |
| transactions | user_id | users.id | CASCADE |
| transactions | category_id | categories.id | RESTRICT |
| budgets | user_id | users.id | CASCADE |
| budgets | category_id | categories.id | RESTRICT |
| notifications | user_id | users.id | CASCADE |
| audit_logs | user_id | users.id | SET NULL |

**Rationale:** Deleting a user cascades to their owned records (categories, transactions, budgets, notifications) but preserves audit history (`SET NULL`) for compliance/traceability. Categories referenced by any transaction/budget cannot be deleted (`RESTRICT`) — deactivate via `is_active = 0` instead.

## 4. Enum Reference

| Table.Column | Allowed Values |
|---|---|
| `categories.type` | `INCOME`, `EXPENSE` |
| `transactions.transaction_type` | `INCOME`, `EXPENSE` |
| `transactions.payment_method` | `CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `WALLET`, `OTHER` |
| `notifications.notification_type` | `BUDGET_WARNING`, `BUDGET_EXCEEDED`, `SYSTEM`, `SECURITY`, `GENERAL` |

## 5. Indexing Strategy

- **Single-column indexes** support direct lookups (`user_id`, `category_id`, `transaction_date`, `transaction_type`, `is_read`, `action`).
- **Composite indexes** are built for the system's actual hot-path queries:
  - `(user_id, transaction_date)` — "my transactions this month" / date-range reports
  - `(user_id, transaction_type)` — income vs. expense breakdown per user
  - `(user_id, category_id)` — category-level spend per user
  - `(user_id, start_date, end_date)` on budgets — active budget lookups
  - `(user_id, is_read)` on notifications — unread-count badge
- All monetary columns use `DECIMAL(12,2)` — never `FLOAT`/`DOUBLE` — to avoid rounding errors in balance/report calculations.

## 6. Derived / Application-Layer Views (Not Physical Tables)

These are computed in Django (via ORM aggregation) rather than stored, to avoid data drift:

```sql
-- Example: monthly income vs expense (illustrative — implement via ORM annotate/aggregate)
SELECT
  DATE_FORMAT(transaction_date, '%Y-%m') AS month,
  transaction_type,
  SUM(amount) AS total
FROM transactions
WHERE user_id = :user_id AND is_deleted = 0
GROUP BY month, transaction_type
ORDER BY month;

-- Example: budget utilization
SELECT
  b.id AS budget_id,
  b.amount AS budget_amount,
  COALESCE(SUM(t.amount), 0) AS spent,
  ROUND(COALESCE(SUM(t.amount), 0) / b.amount * 100, 2) AS utilization_pct
FROM budgets b
LEFT JOIN transactions t
  ON t.category_id = b.category_id
  AND t.user_id = b.user_id
  AND t.transaction_type = 'EXPENSE'
  AND t.is_deleted = 0
  AND t.transaction_date BETWEEN b.start_date AND b.end_date
WHERE b.user_id = :user_id
GROUP BY b.id;
```

## 7. Engineering Notes / Recommendations

- Use `utf8mb4` charset/collation throughout for full Unicode support.
- Consider a custom Django user model (`AUTH_USER_MODEL`) keyed on `email` rather than `username`, mapping directly onto the `users` table.
- Wrap multi-step writes (e.g., transaction create + notification trigger) in DB transactions (`transaction.atomic()`).
- Seed `categories` with `is_default = 1`, `user_id = NULL` rows at migration time (Food, Transport, Salary, Rent, Utilities, etc.).
- Add a periodic job (Celery/cron) to evaluate `budgets.alert_percentage` against current spend and insert rows into `notifications`.
- Retain `audit_logs` independently of user lifecycle (`SET NULL`) to preserve a compliant history trail.