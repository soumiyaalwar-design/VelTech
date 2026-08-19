# Expense Tracker System — Backend Implementation Plan

**Status:** Planning Phase (No code yet)  
**Reference:** SRS.md, DATABASE_DESIGN.md, API_SPEC.md, DEVELOPMENT_PLAN.md  
**Tech Stack:** Python 3.9+ · Django 4.2 · DRF 3.14 · MySQL 8.x · JWT (simplejwt) · django-filter

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Django App Structure](#2-django-app-structure)
3. [Data Models & Relationships](#3-data-models--relationships)
4. [Serializers Strategy](#4-serializers-strategy)
5. [Authentication & Permissions](#5-authentication--permissions)
6. [API Routing & ViewSets](#6-api-routing--viewsets)
7. [Key Business Logic](#7-key-business-logic)
8. [Testing Strategy](#8-testing-strategy)
9. [Implementation Sequence](#9-implementation-sequence)
10. [Deliverables Checklist](#10-deliverables-checklist)

---

## 1. Architecture Overview

### 1.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React + Axios)                      │
│  - Components, pages, services                            │
│  - RESTful API client with JWT interceptor                │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS REST + Bearer JWT
┌──────────────────▼──────────────────────────────────────┐
│  API LAYER (Django REST Framework)                       │
│  - Serializers (input validation + serialization)        │
│  - ViewSets / APIViews (request routing + response)      │
│  - Permissions (authentication + ownership checks)       │
│  - Exception handling (standard response envelope)       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  DOMAIN / SERVICE LAYER                                  │
│  - Business logic (financial formulas, calculations)     │
│  - Validators (amount > 0, dates, category matching)     │
│  - Queries (optimized with select_related, prefetch)     │
│  - Signals (audit logging, notifications triggers)       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  DATA LAYER (Django ORM)                                 │
│  - Models (User, Category, Transaction, etc.)            │
│  - Migrations (schema versioning)                        │
│  - Custom managers (default filters, optimizations)      │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│  DATABASE (MySQL 8.x)                                    │
│  - 6 tables: users, categories, transactions, budgets,   │
│    notifications, audit_logs                             │
│  - Foreign keys, indexes, constraints as per schema      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Request/Response Flow

```
REQUEST:
  React → POST /api/v1/transactions/
         Authorization: Bearer <jwt_access_token>
         { "category_id": 4, "amount": 100.50, ... }

DJANGO PROCESSING:
  1. JWT middleware validates token → extract user_id
  2. Deserialize & validate input via serializer
  3. Apply business logic (category type match, amount > 0)
  4. Check object-level permission (IsOwner)
  5. Save to DB, trigger signals (audit log, notifications)
  6. Serialize response object
  7. Wrap in standard envelope

RESPONSE:
  200 / 201
  {
    "success": true,
    "message": "Transaction created successfully",
    "data": { "id": 101, ... }
  }

ERROR RESPONSE (e.g., validation):
  422
  {
    "success": false,
    "message": "Validation failed",
    "errors": { "amount": ["Amount must be > 0"] }
  }
```

### 1.3 Authentication Flow

```
LOGIN:
  POST /auth/login/ { "email": "...", "password": "..." }
  ↓ Validate credentials
  ↓ Hash password check
  ↓ Issue JWT tokens (access + refresh)
  200 { "access": "...", "refresh": "...", "user": {...} }

AUTHENTICATED REQUEST:
  GET /api/v1/transactions/
  Authorization: Bearer <access_token>
  ↓ simplejwt middleware
  ↓ Verify signature + expiry
  ↓ Extract user_id from token
  ↓ Attach request.user → rest of processing

TOKEN REFRESH:
  POST /auth/token/refresh/ { "refresh": "..." }
  ↓ Verify refresh token
  ↓ Issue new access token
  200 { "access": "..." }

LOGOUT:
  POST /auth/logout/ { "refresh": "..." }
  ↓ Optional: Blacklist refresh token (if using redis/db)
  ↓ Or rely on client-side deletion
  204 No Content
```

---

## 2. Django App Structure

```
backend/
│
├── manage.py
├── requirements.txt
├── .env.example
├── .gitignore
│
├── config/                        ← Django project settings
│   ├── __init__.py
│   ├── settings.py                ← DB, JWT, CORS, apps, middleware
│   ├── urls.py                    ← Main routing (api/v1/*)
│   ├── asgi.py
│   ├── wsgi.py
│   └── constants.py               ← Enums, choices, app-wide constants
│
├── apps/
│   │
│   ├── accounts/                  ← Custom user model, auth endpoints
│   │   ├── models.py              ← CustomUser (email-based)
│   │   ├── serializers.py         ← Registration, login, profile
│   │   ├── views.py               ← Auth viewsets (register, login, refresh, etc.)
│   │   ├── permissions.py         ← IsAuthenticated checks
│   │   ├── managers.py            ← CustomUserManager
│   │   ├── urls.py                ← Auth endpoint routing
│   │   ├── admin.py               ← Admin interface
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   │
│   ├── categories/                ← Categories (default + custom)
│   │   ├── models.py              ← Category model
│   │   ├── serializers.py         ← CategorySerializer
│   │   ├── views.py               ← CategoryViewSet (list, create, update, deactivate)
│   │   ├── permissions.py         ← IsCategoryOwnerOrReadDefault
│   │   ├── urls.py
│   │   ├── filters.py             ← CategoryFilterSet (type, is_active)
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   │
│   ├── transactions/              ← Income/expense transactions
│   │   ├── models.py              ← Transaction model (soft-delete)
│   │   ├── serializers.py         ← TransactionSerializer
│   │   ├── views.py               ← TransactionViewSet (CRUD, soft-delete)
│   │   ├── permissions.py         ← IsTransactionOwner
│   │   ├── urls.py
│   │   ├── filters.py             ← TransactionFilterSet (type, category, date, amount, search)
│   │   ├── managers.py            ← Custom manager (exclude soft-deleted)
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   │
│   ├── budgets/                   ← Budget tracking
│   │   ├── models.py              ← Budget model
│   │   ├── serializers.py         ← BudgetSerializer (w/ computed fields)
│   │   ├── views.py               ← BudgetViewSet (list, create, update, delete)
│   │   ├── permissions.py         ← IsBudgetOwner
│   │   ├── services.py            ← calculate_utilization(), get_budget_status()
│   │   ├── urls.py
│   │   ├── filters.py             ← BudgetFilterSet (status, date range)
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   │
│   ├── analytics/                 ← Dashboard & reports aggregations
│   │   ├── models.py              ← (Empty; read-only endpoints)
│   │   ├── serializers.py         ← SummarySerializer, MonthlySerializer, etc.
│   │   ├── views.py               ← AnalyticsViewSet (summary, monthly, categories, etc.)
│   │   ├── permissions.py         ← IsAuthenticated
│   │   ├── services.py            ← Aggregation logic (ORM-based)
│   │   ├── urls.py
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   │
│   ├── notifications/             ← Alerts & messages
│   │   ├── models.py              ← Notification model
│   │   ├── serializers.py         ← NotificationSerializer
│   │   ├── views.py               ← NotificationViewSet (list, mark-read, delete)
│   │   ├── permissions.py         ← IsNotificationOwner
│   │   ├── urls.py
│   │   ├── services.py            ← create_budget_alert(), etc.
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   │
│   ├── audit/                     ← Immutable audit trail
│   │   ├── models.py              ← AuditLog model
│   │   ├── serializers.py         ← AuditLogSerializer
│   │   ├── views.py               ← AuditLogViewSet (admin-only list)
│   │   ├── permissions.py         ← IsAdminUser
│   │   ├── signals.py             ← Signal handlers for logging sensitive actions
│   │   ├── urls.py
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   │
│   └── core/                      ← Shared utilities
│       ├── __init__.py
│       ├── exceptions.py          ← CustomException, StandardResponse
│       ├── permissions.py         ← IsOwner, IsOwnerOrReadOnly base classes
│       ├── serializers.py         ← BaseModelSerializer, TimeStampedSerializer
│       ├── constants.py           ← Enum choices, app-wide constants
│       ├── utils.py               ← Helpers (validators, calculators)
│       ├── middleware.py          ← Custom middleware (request logging, audit context)
│       └── tests.py               ← Shared test utilities
│
└── tests/                         ← Project-level test utilities
    ├── __init__.py
    ├── fixtures.py                ← Reusable test data factories
    └── utils.py                   ← Test helpers (API client, auth helpers)
```

---

## 3. Data Models & Relationships

### 3.1 Model Diagram

```
┌─────────────────┐
│     User        │ (email-based custom user model)
│                 │
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ first_name      │
│ last_name       │
│ phone (NULL)    │
│ profile_image   │
│ is_active       │
│ is_admin        │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ (1)
         ├─ Has many (1:N) ─→ Categories (user_id, NULL for defaults)
         ├─ Has many (1:N) ─→ Transactions
         ├─ Has many (1:N) ─→ Budgets
         ├─ Has many (1:N) ─→ Notifications
         └─ Has many (1:N) ─→ AuditLogs (nullable)

┌──────────────────────┐
│     Category         │
│                      │
│ id (PK)              │
│ user_id (FK, NULL)   │ ← NULL = system default
│ name                 │
│ type (INCOME|EXP)    │
│ icon (NULL)          │
│ color (NULL)         │
│ description          │
│ is_default           │
│ is_active            │
│ created_at           │
│ updated_at           │
└───┬──────────────┬───┘
    │ (1)          │ (1)
    │              │
    ▼ (N)          ▼ (N)
┌──────────────┐  ┌──────────────┐
│ Transaction  │  │   Budget     │
│              │  │              │
│ id (PK)      │  │ id (PK)      │
│ user_id (FK) │  │ user_id (FK) │
│ category_id  │  │ category_id  │
│ type         │  │ amount       │
│ amount       │  │ start_date   │
│ description  │  │ end_date     │
│ date         │  │ alert_%      │
│ payment_meth │  │ created_at   │
│ notes        │  │ updated_at   │
│ is_deleted   │  └──────────────┘
│ created_at   │
│ updated_at   │
└──────────────┘

┌─────────────────────┐
│   Notification      │
│                     │
│ id (PK)             │
│ user_id (FK)        │
│ title               │
│ message             │
│ notification_type   │
│ is_read             │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│    AuditLog         │
│                     │
│ id (PK)             │
│ user_id (FK, NULL)  │
│ action              │
│ entity_type         │
│ entity_id           │
│ description         │
│ ip_address          │
│ user_agent          │
│ created_at          │
└─────────────────────┘
```

### 3.2 Key Model Properties

#### `CustomUser` (accounts.models.py)
- **Base:** AbstractBaseUser + PermissionsMixin
- **Primary key:** email (unique, used for login)
- **Fields:** password_hash (hashed), first_name, last_name, phone, profile_image, is_active, is_admin, created_at, updated_at
- **Manager:** CustomUserManager (create_user, create_superuser)
- **Methods:** `__str__()`, `get_full_name()`, `get_short_name()`
- **Validation:** email uniqueness, format via DRF serializer

#### `Category`
- **PK:** id (BIGINT auto-increment)
- **FK:** user_id (NULL = system default category, CASCADE on user delete)
- **Unique constraint:** (user_id, name, type) — no duplicate category names per user per type
- **Type:** ENUM(INCOME, EXPENSE)
- **Defaults:** Seeded during migrations (Salary, Rent, Groceries, etc.)
- **Soft-deactivation:** `is_active` flag prevents hard deletion if still referenced by transactions/budgets

#### `Transaction`
- **PK:** id
- **FK:** user_id (CASCADE), category_id (RESTRICT — can't delete category with transactions)
- **Type:** ENUM(INCOME, EXPENSE) — must match category.type
- **Amount:** DECIMAL(12,2), CHECK > 0
- **Soft-delete:** `is_deleted` flag (never hard-delete; excludes from queries/reports)
- **Payment method:** ENUM(CASH, CARD, UPI, BANK_TRANSFER, WALLET, OTHER)
- **Indexes:** (user_id, date), (user_id, type), (user_id, category_id) for common queries

#### `Budget`
- **PK:** id
- **FK:** user_id (CASCADE), category_id (RESTRICT)
- **Type:** Must link to EXPENSE category (enforced via serializer validation)
- **Constraints:** amount > 0, end_date >= start_date
- **Alert threshold:** alert_percentage (default 80%)
- **Status field:** Computed (ON_TRACK / WARNING / EXCEEDED), not stored

#### `Notification`
- **PK:** id
- **FK:** user_id (CASCADE)
- **Type:** ENUM(BUDGET_WARNING, BUDGET_EXCEEDED, SYSTEM, SECURITY, GENERAL)
- **Read state:** is_read flag (default false)
- **Trigger:** Background job or signal-based on budget checks, login attempts, etc.

#### `AuditLog`
- **PK:** id
- **FK:** user_id (SET NULL — preserve audit trail even if user deleted)
- **Action:** VARCHAR (enum-like values: REGISTER, LOGIN, LOGOUT, TRANSACTION_CREATE, etc.)
- **Entity tracking:** entity_type, entity_id (which object was modified)
- **Request context:** ip_address, user_agent
- **Immutable:** Once created, never modified

---

## 4. Serializers Strategy

### 4.1 Serializer Hierarchy

```
BaseSerializer (core/serializers.py)
├── NestedSerializer (for FK relationships)
├── TimestampedSerializer (includes created_at, updated_at)
│
├── UserSerializer
│   ├── UserRegistrationSerializer (write-only: email, password, confirm_password, names)
│   ├── UserLoginSerializer (write-only: email, password)
│   └── UserProfileSerializer (read: full profile; write: first_name, last_name, phone, profile_image)
│
├── CategorySerializer
│   ├── CategoryCreateSerializer (write: name, type, icon, color, description)
│   └── CategoryListSerializer (read: including owner info & defaults)
│
├── TransactionSerializer
│   ├── TransactionCreateSerializer (write: category_id, type, amount, description, date, payment_method, notes)
│   ├── TransactionUpdateSerializer (write: category_id, amount, description, date, payment_method, notes)
│   └── TransactionListSerializer (read: full object + nested category)
│
├── BudgetSerializer
│   ├── BudgetCreateSerializer (write: category_id, amount, start_date, end_date, alert_percentage)
│   └── BudgetListSerializer (read: full object + computed fields: spent, remaining, utilization_%, status)
│
├── NotificationSerializer (read: full object; write: only is_read)
│
├── AnalyticsSerializer
│   ├── SummarySerializer (read-only aggregation result)
│   ├── MonthlyTrendSerializer (read-only per-month breakdown)
│   ├── CategorySpendSerializer (read-only category totals)
│   └── BudgetStatusSerializer (read-only budget utilization)
│
└── AuditLogSerializer (read-only for admins)
```

### 4.2 Key Validation Patterns

**In Serializers (DRF-level):**

```python
# Amount validation
def validate_amount(self, value):
    if value <= 0:
        raise ValidationError("Amount must be greater than zero.")
    return value

# Category type matching
def validate(self, data):
    category = data['category_id']
    tx_type = data['transaction_type']
    if category.type != tx_type:
        raise ValidationError({
            'category_id': 'Category type must match transaction type.'
        })
    return data

# Budget date range
def validate(self, data):
    if data['end_date'] < data['start_date']:
        raise ValidationError({
            'end_date': 'end_date cannot be earlier than start_date.'
        })
    return data

# Budget must link to EXPENSE category
def validate_category_id(self, value):
    if value.type != 'EXPENSE':
        raise ValidationError("Budgets can only be created for EXPENSE categories.")
    return value
```

### 4.3 Nested Relationships

```python
# TransactionSerializer with nested category
class TransactionSerializer(serializers.ModelSerializer):
    category = CategorySerializer(source='category_id', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Transaction
        fields = ['id', 'category', 'category_id', 'type', 'amount', ...]

# BudgetSerializer with computed fields
class BudgetSerializer(serializers.ModelSerializer):
    category = CategorySerializer(source='category_id', read_only=True)
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    def get_spent(self, obj):
        # Query sum of expenses in this budget's date range & category
        return calculate_budget_spent(obj)
    
    def get_status(self, obj):
        utilization = self.get_utilization_percentage(obj)
        if utilization >= 100:
            return 'EXCEEDED'
        elif utilization >= obj.alert_percentage:
            return 'WARNING'
        return 'ON_TRACK'
```

---

## 5. Authentication & Permissions

### 5.1 JWT Configuration (settings.py)

```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'corsheaders',
    # ... app list
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': settings.SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

### 5.2 Permission Classes

**core/permissions.py:**

```python
class IsOwner(permissions.BasePermission):
    """
    Allow access only to the owner of an object.
    Assumes model has a `user` or `user_id` foreign key.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id or obj.user == request.user

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owner to modify; others can read."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class IsCategoryOwnerOrReadDefault(permissions.BasePermission):
    """Category owned by user, OR is a system default (user_id = NULL)."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.user_id == request.user.id or obj.user_id is None
        return obj.user_id == request.user.id

class IsBudgetOwner(permissions.BasePermission):
    """Budget must be owned by authenticated user."""
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id

class IsAdminUser(permissions.BasePermission):
    """Only allow admin users (is_admin = True)."""
    def has_permission(self, request, view):
        return request.user and request.user.is_admin
```

### 5.3 Authentication Endpoints (accounts/views.py)

```python
# POST /auth/register/
class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    # Creates user, returns user info + no tokens

# POST /auth/login/
class LoginView(generics.CreateAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    # Validates credentials, returns access + refresh tokens + user

# POST /auth/token/refresh/
class TokenRefreshView(generics.CreateAPIView):
    serializer_class = TokenRefreshSerializer
    permission_classes = [permissions.AllowAny]
    # Takes refresh token, returns new access token

# POST /auth/logout/
class LogoutView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    # Blacklist refresh token (optional, depending on strategy)

# GET /auth/me/
class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

# POST /auth/change-password/
class ChangePasswordView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    # Old + new password validation
```

---

## 6. API Routing & ViewSets

### 6.1 URL Structure (config/urls.py)

```
/api/v1/

  ├─ auth/
  │  ├─ register/              POST
  │  ├─ login/                 POST
  │  ├─ token/refresh/         POST
  │  ├─ logout/                POST
  │  ├─ me/                    GET, PATCH
  │  └─ change-password/       POST
  │
  ├─ categories/
  │  ├─ [LIST, CREATE]         GET, POST
  │  └─ {id}/
  │     ├─ [RETRIEVE, UPDATE]  GET, PATCH
  │     └─ [DELETE]            DELETE (soft)
  │
  ├─ transactions/
  │  ├─ [LIST, CREATE]         GET, POST
  │  └─ {id}/
  │     ├─ [RETRIEVE, UPDATE]  GET, PATCH
  │     └─ [DELETE]            DELETE (soft)
  │
  ├─ budgets/
  │  ├─ [LIST, CREATE]         GET, POST
  │  └─ {id}/
  │     ├─ [RETRIEVE, UPDATE]  GET, PATCH
  │     └─ [DELETE]            DELETE
  │
  ├─ notifications/
  │  ├─ [LIST]                 GET
  │  ├─ unread-count/          GET
  │  └─ {id}/
  │     ├─ [MARK READ]         PATCH
  │     └─ [DELETE]            DELETE
  │  └─ mark-all-read/         PATCH
  │
  ├─ analytics/
  │  ├─ summary/               GET
  │  ├─ monthly/               GET
  │  ├─ categories/            GET
  │  ├─ income-expense/        GET
  │  └─ budget-status/         GET
  │
  └─ admin/
     ├─ users/                 GET
     ├─ users/{id}/            PATCH
     ├─ categories/            GET
     └─ audit-logs/            GET
```

### 6.2 ViewSet Example (transactions/views.py)

```python
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from transactions.models import Transaction
from transactions.serializers import TransactionSerializer, TransactionCreateSerializer
from transactions.permissions import IsTransactionOwner
from transactions.filters import TransactionFilterSet

class TransactionViewSet(viewsets.ModelViewSet):
    """
    CRUD for transactions.
    - List: filtered, paginated, user-scoped
    - Create: validates category type match
    - Update: user-owned only
    - Delete: soft-delete (is_deleted = True)
    """
    permission_classes = [permissions.IsAuthenticated, IsTransactionOwner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = TransactionFilterSet
    ordering_fields = ['transaction_date', 'amount', 'created_at']
    search_fields = ['description', 'notes']
    pagination_class = PageNumberPagination

    def get_queryset(self):
        """Return only this user's transactions (exclude soft-deleted)."""
        return Transaction.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('category_id')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        """Auto-assign user."""
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        """Soft-delete instead of hard delete."""
        instance.is_deleted = True
        instance.save()

    def destroy(self, request, *args, **kwargs):
        """Return 204 on soft-delete."""
        self.perform_destroy(self.get_object())
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### 6.3 Analytics ViewSet Example (analytics/views.py)

```python
class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only aggregation endpoints."""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Dashboard summary: income, expenses, balance, savings rate."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Default to current month if not specified
        if not start_date or not end_date:
            start_date = date.today().replace(day=1)
            end_date = date.today()
        
        # Use ORM aggregate to compute in-database
        result = Transaction.objects.filter(
            user=request.user,
            is_deleted=False,
            transaction_date__range=[start_date, end_date]
        ).aggregate(
            total_income=Coalesce(
                Sum('amount', filter=Q(transaction_type='INCOME')), 0
            ),
            total_expenses=Coalesce(
                Sum('amount', filter=Q(transaction_type='EXPENSE')), 0
            )
        )
        
        total_income = Decimal(result['total_income'])
        total_expenses = Decimal(result['total_expenses'])
        balance = total_income - total_expenses
        savings_rate = (
            ((balance / total_income) * 100) if total_income > 0 else 0
        )
        
        return Response({
            'success': True,
            'data': {
                'total_income': str(total_income),
                'total_expenses': str(total_expenses),
                'balance': str(balance),
                'savings_rate': float(savings_rate),
            }
        })

    @action(detail=False, methods=['get'])
    def monthly(self, request):
        """Monthly income/expense trend for N months."""
        months = int(request.query_params.get('months', 6))
        
        # Aggregate by month
        results = Transaction.objects.filter(
            user=request.user,
            is_deleted=False
        ).extra(
            select={'month': 'DATE_TRUNC("month", transaction_date)'}
        ).values('month').annotate(
            income=Coalesce(
                Sum('amount', filter=Q(transaction_type='INCOME')), 0
            ),
            expenses=Coalesce(
                Sum('amount', filter=Q(transaction_type='EXPENSE')), 0
            )
        ).order_by('-month')[:months]
        
        return Response({
            'success': True,
            'data': list(results)
        })
```

---

## 7. Key Business Logic

### 7.1 Financial Formulas (core/utils.py or services)

```python
from decimal import Decimal

def calculate_balance(total_income, total_expenses):
    """Balance = Income - Expenses"""
    return total_income - total_expenses

def calculate_savings_rate(total_income, total_expenses):
    """Savings Rate = ((Income - Expenses) / Income) × 100"""
    if total_income == 0:
        return Decimal(0)
    return ((total_income - total_expenses) / total_income) * 100

def calculate_budget_utilization(spent, budget_amount):
    """Utilization % = (Spent / Budget Amount) × 100"""
    if budget_amount == 0:
        return Decimal(0)
    return (spent / budget_amount) * 100

def calculate_budget_remaining(budget_amount, spent):
    """Remaining = Budget Amount - Spent"""
    return budget_amount - spent

def get_budget_status(utilization_percentage, alert_threshold):
    """
    Status based on utilization:
    - ON_TRACK: < alert_threshold
    - WARNING: >= alert_threshold and < 100
    - EXCEEDED: >= 100
    """
    if utilization_percentage >= 100:
        return 'EXCEEDED'
    elif utilization_percentage >= alert_threshold:
        return 'WARNING'
    return 'ON_TRACK'
```

### 7.2 Category Validation

```python
# In CategorySerializer
class CategorySerializer(serializers.ModelSerializer):
    def validate(self, data):
        # Ensure uniqueness: (user, name, type) must be unique
        # But allow multiple defaults with user_id=NULL
        if data.get('user_id') is not None:
            existing = Category.objects.filter(
                user_id=data['user_id'],
                name=data['name'],
                type=data['type']
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise ValidationError({
                    'name': 'You already have a category with this name and type.'
                })
        return data
```

### 7.3 Transaction Type Matching

```python
# In TransactionSerializer
class TransactionSerializer(serializers.ModelSerializer):
    def validate(self, data):
        category = data.get('category_id')
        tx_type = data.get('transaction_type')
        
        if category and tx_type:
            if category.type != tx_type:
                raise ValidationError({
                    'category_id': f'Category type must be {category.type}, not {tx_type}.'
                })
        return data
```

### 7.4 Budget Notifications (Budget Alerts)

**Strategy:**
1. When a transaction is created/updated, check if any budgets are affected
2. If budget utilization crosses alert_percentage or 100%, create a notification
3. Can be done via:
   - **Signals** (post_save on Transaction → check and notify)
   - **Management command** (periodic check, e.g., cron)
   - **On-demand** (include notification check in analytics endpoint)

```python
# signals.py - triggered when a transaction is created/updated
from django.db.models.signals import post_save
from django.dispatch import receiver
from transactions.models import Transaction
from budgets.services import check_budget_alerts

@receiver(post_save, sender=Transaction)
def check_budget_on_transaction_change(sender, instance, created, **kwargs):
    """Check and trigger budget alerts when a transaction changes."""
    if not instance.is_deleted and instance.transaction_type == 'EXPENSE':
        check_budget_alerts(instance.user, instance.category_id)

def check_budget_alerts(user, category):
    """Check if category's budgets need alerts."""
    active_budgets = Budget.objects.filter(
        user=user,
        category=category,
        start_date__lte=date.today(),
        end_date__gte=date.today()
    )
    
    for budget in active_budgets:
        spent = Transaction.objects.filter(
            user=user,
            category=category,
            transaction_type='EXPENSE',
            transaction_date__range=[budget.start_date, budget.end_date],
            is_deleted=False
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        utilization = (spent / budget.amount * 100) if budget.amount > 0 else 0
        
        # Check if we should create a notification
        if utilization >= 100:
            if not Notification.objects.filter(
                user=user,
                notification_type='BUDGET_EXCEEDED',
                created_at__date=date.today()
            ).exists():
                Notification.objects.create(
                    user=user,
                    title='Budget Exceeded',
                    message=f'Your {category.name} budget has been exceeded.',
                    notification_type='BUDGET_EXCEEDED'
                )
        elif utilization >= budget.alert_percentage:
            if not Notification.objects.filter(
                user=user,
                notification_type='BUDGET_WARNING',
                created_at__date=date.today()
            ).exists():
                Notification.objects.create(
                    user=user,
                    title='Budget Warning',
                    message=f'You\'ve used {utilization:.1f}% of your {category.name} budget.',
                    notification_type='BUDGET_WARNING'
                )
```

### 7.5 Soft-Delete in Queries

```python
# Create a custom manager to auto-exclude soft-deleted
class ActiveTransactionManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class Transaction(models.Model):
    # ...
    objects = ActiveTransactionManager()  # Default manager
    all_objects = models.Manager()         # Include soft-deleted when needed
    
    class Meta:
        # Ensure is_deleted=False is always considered in analytics
        pass

# In views/analytics, always filter explicitly
queryset = Transaction.objects.filter(is_deleted=False)
```

---

## 8. Testing Strategy

### 8.1 Test Pyramid

```
        ▲
       / \
      /   \  E2E Tests (10-15 critical flows)
     /     \
    /───────\
   /         \  Integration Tests (20-30 scenarios)
  /           \
 /─────────────\
/               \ Unit Tests (100+ test cases)
```

### 8.2 Unit Tests (per app)

**accounts/tests.py**
- UserManager: create_user, create_superuser
- CustomUser model validation
- Registration serializer: uniqueness, password match, format validation
- Login serializer: valid/invalid credentials
- ChangePassword: old password validation, new password confirmation

**categories/tests.py**
- Category creation with uniqueness enforcement
- Category type validation
- User-owned vs. system default categories
- Soft-deactivation (is_active = False)
- FilterSet: by type, is_active

**transactions/tests.py**
- Transaction creation with amount > 0 check
- Category type matching validation
- Soft-delete on destroy
- FilterSet: by type, category, date range, amount, search
- Pagination
- Ownership check (cross-user access denied)

**budgets/tests.py**
- Budget creation with EXPENSE category only
- Date range validation (end >= start)
- Utilization calculation
- Status computation (ON_TRACK / WARNING / EXCEEDED)
- Budget query for date overlaps

**analytics/tests.py**
- Summary: income/expense/balance/savings_rate totals match hand-calculated
- Monthly trend: aggregation correctness
- Category spending: per-category sums
- Budget status: utilization% accuracy

**notifications/tests.py**
- Notification creation
- Mark-as-read
- Mark-all-read
- Delete
- List (paginated, unread-only filter)

**audit/tests.py**
- Log creation on user actions
- Immutability (no updates)
- Admin-only access

### 8.3 Integration Tests

**auth_integration_test.py**
- Register → login → authenticated request → refresh token → logout
- Invalid credentials → 401
- Token expiry → refresh → new access token

**transaction_integration_test.py**
- Create transaction → verify in DB
- Create transaction → generate budget notification → verify notification
- Update transaction → verify timestamp updated
- Delete transaction → soft-delete flag set
- List with filters → verify filtered correctly

**authorization_integration_test.py**
- User A creates transaction → User B cannot read/modify (403)
- User A creates budget → User B cannot list it
- Admin can access other user's audit logs

**analytics_integration_test.py**
- Create multiple transactions → summary totals match
- Create income + expense → balance formula correct
- Soft-deleted transactions excluded from analytics

### 8.4 API Tests (DRF APITestCase)

```python
class TransactionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            user=self.user,
            name='Groceries',
            type='EXPENSE'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_transaction_success(self):
        data = {
            'category_id': self.category.id,
            'transaction_type': 'EXPENSE',
            'amount': '100.50',
            'description': 'Weekly groceries',
            'transaction_date': '2026-08-15',
            'payment_method': 'UPI'
        }
        response = self.client.post('/api/v1/transactions/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Transaction.objects.count(), 1)
    
    def test_create_transaction_invalid_amount(self):
        data = {
            'category_id': self.category.id,
            'transaction_type': 'EXPENSE',
            'amount': '-100.50',  # Negative!
            'transaction_date': '2026-08-15'
        }
        response = self.client.post('/api/v1/transactions/', data)
        self.assertEqual(response.status_code, 422)
        self.assertIn('amount', response.data['errors'])
    
    def test_cross_user_access_denied(self):
        other_user = User.objects.create_user(
            email='other@example.com',
            password='pass123'
        )
        transaction = Transaction.objects.create(
            user=self.user,
            category=self.category,
            transaction_type='EXPENSE',
            amount=100
        )
        self.client.force_authenticate(user=other_user)
        response = self.client.get(f'/api/v1/transactions/{transaction.id}/')
        self.assertEqual(response.status_code, 403)
```

### 8.5 Security Tests

```python
class SecurityTest(APITestCase):
    def test_unauthenticated_access_rejected(self):
        """401 on missing token."""
        response = self.client.get('/api/v1/transactions/')
        self.assertEqual(response.status_code, 401)
    
    def test_invalid_token_rejected(self):
        """401 on bad/expired token."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get('/api/v1/transactions/')
        self.assertEqual(response.status_code, 401)
    
    def test_sql_injection_prevented(self):
        """Search parameter sanitized."""
        self.client.force_authenticate(user=self.user)
        data = {'search': "'; DROP TABLE transactions; --"}
        response = self.client.get('/api/v1/transactions/', data)
        self.assertEqual(response.status_code, 200)  # No crash
        # Verify data still intact
        self.assertTrue(Transaction.objects.exists())
    
    def test_rate_limiting_on_auth_endpoints(self):
        """Multiple failed login attempts throttled."""
        for i in range(10):
            response = self.client.post(
                '/auth/login/',
                {'email': 'test@example.com', 'password': 'wrong'}
            )
        # Should get 429 after N attempts
        self.assertIn(response.status_code, [429, 401])
```

### 8.6 Test Data Fixtures

**tests/fixtures.py** — Use factory_boy for realistic test data:

```python
import factory
from accounts.models import User
from categories.models import Category
from transactions.models import Transaction

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = 'Test'
    last_name = 'User'
    password = 'testpass123'

class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category
    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f'Category {n}')
    type = 'EXPENSE'
    is_active = True

class TransactionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Transaction
    user = factory.SubFactory(UserFactory)
    category = factory.SubFactory(CategoryFactory, user=factory.SelfAttribute('..user'))
    transaction_type = 'EXPENSE'
    amount = factory.Faker('pydecimal', left_digits=5, right_digits=2, positive=True)
    transaction_date = factory.Faker('date_object')
```

---

## 9. Implementation Sequence

**Phase 1: Foundation & Authentication (Week 1–2)**
```
1.1 Project structure & environment
    - manage.py, requirements.txt, .env template
    - django-admin startproject config .
    - Create 7 apps (accounts, categories, transactions, budgets, analytics, notifications, audit)
    - Create core/ (shared utils)

1.2 CustomUser model (accounts/models.py)
    - Email-based primary key
    - Manager: create_user, create_superuser
    - Migrations

1.3 JWT Configuration (config/settings.py, config/urls.py)
    - INSTALLED_APPS: DRF, simplejwt, django-filter, corsheaders
    - JWT settings (access/refresh lifetimes, algorithm)
    - CORS configuration
    - Global exception handler (StandardResponse wrapper)
    - Base pagination, filter backends

1.4 Authentication Endpoints (accounts/views.py, serializers.py, urls.py)
    - RegisterView (POST /auth/register/)
    - LoginView (POST /auth/login/)
    - TokenRefreshView (POST /auth/token/refresh/)
    - LogoutView (POST /auth/logout/)
    - CurrentUserView (GET/PATCH /auth/me/)
    - ChangePasswordView (POST /auth/change-password/)

1.5 Default Categories Seed Migration
    - 10–15 system categories (is_default=1, user_id=NULL)
    - Income: Salary, Freelance, Interest, etc.
    - Expense: Groceries, Rent, Transport, Utilities, etc.

1.6 Unit tests for auth
    - User creation, validation, login/registration flows
```

**Phase 2: Categories & Transactions (Week 3–4)**
```
2.1 Category Model (categories/models.py)
    - User ownership, type (INCOME/EXPENSE), is_active, unique constraint
    - Migrations

2.2 Transaction Model (transactions/models.py)
    - User, category FK, type, amount, soft-delete, all fields
    - Constraint: amount > 0
    - Custom manager: exclude is_deleted=True by default
    - Migrations

2.3 Category ViewSet & Serializers (categories/)
    - List (own + defaults), Create, Retrieve, Update, Delete (soft-deactivate)
    - Serializers: CategorySerializer, CategoryCreateSerializer
    - Permissions: IsCategoryOwnerOrReadDefault
    - Filters: by type, is_active

2.4 Transaction ViewSet & Serializers (transactions/)
    - CRUD, soft-delete on DELETE
    - Serializers: TransactionSerializer, TransactionCreateSerializer, etc.
    - Permissions: IsTransactionOwner
    - Filters: type, category, date range, amount range, payment_method, search
    - Pagination
    - Ordering

2.5 URLs (categories/urls.py, transactions/urls.py)
    - /api/v1/categories/
    - /api/v1/transactions/

2.6 Integration & API tests
    - End-to-end transaction CRUD
    - Cross-user access denial
    - Category type validation
    - Soft-delete behavior
```

**Phase 3: Budgets & Notifications (Week 5)**
```
3.1 Budget Model (budgets/models.py)
    - User, category FK (EXPENSE only), amount, dates, alert_percentage
    - Constraints: amount > 0, end_date >= start_date
    - Migrations

3.2 Notification Model (notifications/models.py)
    - User, title, message, type, is_read
    - Migrations

3.3 Budget ViewSet & Serializers (budgets/)
    - CRUD
    - Computed fields: spent, remaining, utilization_%, status
    - Serializer validates category type = EXPENSE
    - Permissions: IsBudgetOwner

3.4 Notification ViewSet & Serializers (notifications/)
    - List, mark-read, mark-all-read, delete, unread-count
    - Permissions: IsNotificationOwner

3.5 Budget Alert System (budgets/services.py, signals)
    - Signal on Transaction post_save
    - check_budget_alerts() logic
    - Create BUDGET_WARNING / BUDGET_EXCEEDED notifications
    - Avoid duplicate notifications (same day check)

3.6 Tests
    - Budget CRUD, utilization calculation
    - Alert threshold logic
    - Notification creation
```

**Phase 4: Dashboard & Analytics (Week 6)**
```
4.1 Analytics ViewSet (analytics/views.py)
    - summary: income/expense/balance/savings_rate
    - monthly: trend over N months
    - categories: spending by category
    - income-expense: totals
    - budget-status: utilization across active budgets

4.2 Analytics Services (analytics/services.py)
    - Aggregation logic using ORM annotate/aggregate
    - Date range filtering
    - Soft-delete exclusion

4.3 Tests
    - Dashboard totals correctness
    - Aggregation accuracy
    - Soft-deleted transactions excluded
```

**Phase 5: Reports, Admin & Audit (Week 7)**
```
5.1 Audit Model (audit/models.py)
    - Action, entity_type, entity_id, user_id (nullable), ip, user_agent, timestamp
    - Migrations

5.2 Audit Signals (audit/signals.py)
    - Register signal handlers for sensitive actions:
      - User registration, login, logout, password change
      - Transaction create, update, delete
      - Budget create, delete
      - Admin actions

5.3 Admin Endpoints (audit/views.py)
    - UserListView: GET /admin/users/
    - UserUpdateView: PATCH /admin/users/{id}/
    - CategoryListView: GET /admin/categories/
    - AuditLogViewSet: GET /admin/audit-logs/ (with query filters)
    - Permissions: IsAdminUser

5.4 Audit Tests
    - Log entries created on sensitive actions
    - Admin-only access
    - Immutability of logs
```

**Phase 6: Hardening, Testing & Deployment (Week 8)**
```
6.1 Security Pass
    - CORS allow-list (production IPs only)
    - Security headers (HSTS, CSP, etc.)
    - Rate limiting on /auth/* endpoints (via django-ratelimit or DRF throttling)
    - Dependency audit (pip-audit, safety)
    - Secret rotation strategy
    - No secrets in repo (.env in .gitignore)

6.2 Test Suite Completion
    - Target coverage on core logic (auth, CRUD, permissions, formulas)
    - Run full test suite in CI
    - Pytest configuration with coverage reporting

6.3 Performance Pass
    - Verify database indexes match hot-path queries (EXPLAIN)
    - Add select_related/prefetch_related to avoid N+1
    - Confirm pagination on every list endpoint
    - Load test: simulate 100+ concurrent users

6.4 Docker & Deployment
    - Dockerfile (Python + Django)
    - docker-compose.yml (Django + MySQL)
    - Nginx reverse proxy config
    - Gunicorn WSGI config
    - CI/CD pipeline (GitHub Actions): lint → test → build

6.5 Production Checklist
    - DEBUG = False
    - ALLOWED_HOSTS configured
    - HTTPS certificates (Let's Encrypt)
    - Database backups (automated)
    - Error monitoring (Sentry integration)
    - Logging to file/syslog
    - Verify all acceptance criteria (SRS §26)
```

---

## 10. Deliverables Checklist

### Project Setup
- [ ] Django project initialized (`config/` + 7 apps + `core/`)
- [ ] `.env.example` committed (no actual secrets)
- [ ] `.gitignore` configured (`.env`, `venv/`, `.vscode/`, etc.)
- [ ] MySQL database created and empty
- [ ] Git branches created (main, develop, feature/*)

### Phase 1 (Authentication)
- [ ] CustomUser model implemented
- [ ] Migration applied
- [ ] 6 auth endpoints working + tests passing
- [ ] JWT configuration tested
- [ ] Seed migration for default categories
- [ ] Unit tests (registration, login, password change)
- [ ] Integration test (register → login → authenticated request)

### Phase 2 (Categories & Transactions)
- [ ] Category model + migrations
- [ ] Transaction model + migrations
- [ ] Category CRUD ViewSet + serializers
- [ ] Transaction CRUD ViewSet + serializers
- [ ] Soft-delete on transaction DELETE
- [ ] Filtering + pagination on transactions
- [ ] Category type validation
- [ ] Ownership checks on all endpoints
- [ ] API tests (create, filter, cross-user denial)
- [ ] Unit tests (validation, serializer logic)

### Phase 3 (Budgets & Notifications)
- [ ] Budget model + migrations
- [ ] Notification model + migrations
- [ ] Budget CRUD ViewSet + computed fields
- [ ] Notification endpoints (list, mark-read, delete, unread-count)
- [ ] Budget alert system (signals + services)
- [ ] Utilization calculation tests
- [ ] Alert notification tests
- [ ] Status computation tests

### Phase 4 (Analytics)
- [ ] Analytics ViewSet with 5 endpoints
- [ ] Aggregation services
- [ ] Summary serializers
- [ ] Tests verifying formula correctness
- [ ] Tests excluding soft-deleted data

### Phase 5 (Admin & Audit)
- [ ] Audit model + migrations
- [ ] Signal handlers for 5+ sensitive actions
- [ ] Admin endpoints (users, categories, audit logs)
- [ ] Admin permission checks
- [ ] Audit log tests

### Phase 6 (Hardening & Deployment)
- [ ] CORS configured (allow-list)
- [ ] Rate limiting on auth endpoints
- [ ] All dependencies up-to-date + audit passed
- [ ] Security headers configured
- [ ] Comprehensive test suite (100+ tests)
- [ ] Test coverage report (target: 70%+ core logic)
- [ ] Performance verification (index plans, N+1 checks)
- [ ] Dockerfile + docker-compose.yml
- [ ] Nginx config
- [ ] Gunicorn config
- [ ] GitHub Actions CI/CD pipeline
- [ ] Deployment documentation
- [ ] All SRS §26 acceptance criteria verified

### Code Quality
- [ ] PEP 8 compliance (black, flake8)
- [ ] Type hints on public functions (optional, for maintainability)
- [ ] Docstrings on models, serializers, services
- [ ] README with setup/deployment instructions
- [ ] API documentation (auto-generated via DRF or Swagger)

---

## Summary

This backend implementation plan provides:

1. **Architecture**: Layered design with clear separation of concerns (API → Domain → ORM → DB)
2. **Apps**: 7 focused Django apps (accounts, categories, transactions, budgets, analytics, notifications, audit) + shared `core/`
3. **Models**: 6 tables with proper relationships, constraints, and soft-delete strategy
4. **Serializers**: Hierarchical, reusable serializers with validation at DRF level
5. **Permissions**: Custom permission classes for ownership + role checks
6. **Routing**: Clean, versioned REST API (`/api/v1/*`) following SRS spec
7. **Business Logic**: Financial formulas, validations, and notifications in services/signals
8. **Testing**: 4-level pyramid (unit → integration → API → security) with fixtures and realistic scenarios
9. **Sequence**: 6-phase, 8-week delivery aligned to MVP path and DEVELOPMENT_PLAN.md
10. **Hardening**: Security, performance, and deployment considerations

**Ready for implementation!**
