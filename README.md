# 🛒 E-Commerce App — DDD, Hybrid Search & PayPal Sandbox

A full-stack e-commerce application built with **Domain-Driven Design (DDD)**, hybrid product search, PostgreSQL, Redis, PayPal Sandbox, centralized configuration, rate limiting, automated testing, **atomic database transactions**, Event-Driven Architecture (EDA), background email processing, and a neon-glass cyber UI.

## ✨ Features

- 🛍️ Complete shopping experience with products, categories, carts and orders
- 🔍 Hybrid search combining PostgreSQL keyword search and ChromaDB semantic search
- 💳 PayPal Sandbox payment integration
- 🔄 Event-Driven Architecture (EDA) for post-payment processing
- 🔐 Authentication and session management
- 👨‍💼 Admin panel with product, category and order management
- 📧 Email notifications with background worker processing
- 🛡️ Global API and login-specific rate limiting
- ⚠️ User-friendly error handling
- ⚙️ Centralized application configuration
- 🔒 Atomic database transactions for consistent stock reservations and order operations
- 🐳 Docker Compose infrastructure
- ✅ Automated testing with Pytest and GitHub Actions

---

# 🏗️ Architecture

The backend follows **Domain-Driven Design (DDD)** principles, separating business logic from infrastructure and presentation.

```text
src/
├── application/
│   ├── dto/
│   └── use_cases/
├── domain/
│   ├── entities/
│   ├── interfaces/
│   ├── rules/
│   └── services/
├── infrastructure/
│   ├── db/
│   ├── helpers/
│   └── repositories/
├── routes/
└── core/
    └── config.py
```

### Main Layers

- **Domain:** Core business logic, entities, rules, services and repository interfaces.
- **Application:** Use cases coordinating operations such as registration, authentication, cart operations, orders and payments.
- **Infrastructure:** External technologies including PostgreSQL, SQLAlchemy, Redis, ChromaDB and email services.
- **Presentation:** FastAPI routes connecting HTTP requests to application use cases.

### Atomic Database Transactions

The application uses **atomic database operations and transactions** to keep inventory and order state consistent when multiple users interact with the application concurrently.

For stock reservations, inventory is updated using an atomic database operation that checks whether enough stock exists and decreases the stock in the same operation.

```sql
UPDATE products
SET stock = stock - :quantity
WHERE id = :product_id
  AND stock >= :quantity;
```

If the update affects one row, the reservation succeeds. If it affects zero rows, there was not enough stock available.

This prevents race conditions where multiple customers could otherwise read the same stock value and oversell the product.

Order creation and stock reservation are also handled within a database transaction so that related changes can be committed together. If an operation fails before the transaction is committed, the uncommitted changes can be rolled back instead of leaving the database in an inconsistent state.

This is especially important when an order contains multiple products. Either the required stock reservations and order creation succeed together, or the transaction does not commit the partial changes.

### Event-Driven Architecture

The application also uses **Event-Driven Architecture (EDA)** for actions that happen after successful payments.

After PayPal payment completion, the backend publishes a `payment.completed` event. Independent handlers subscribe to this event and perform the required follow-up operations.

```text
               PayPal Payment
                    │
                    ▼
           Payment Completed Event
                    │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    Update Stock  Clear Cart  Send Email
         │           │           │
         │           │           ▼
         │           │      Background
         │           │        Worker
         │           │           │
         └───────────┴───────────▼
                          Confirmation Email
```

The payment event is handled by separate components for:

- Updating product stock
- Clearing the user's cart
- Sending a payment confirmation email

This keeps the payment flow decoupled from the individual operations that need to happen after a successful payment.

---

# ⚙️ Centralized Configuration

Application settings are centralized through:

```python
core.config.settings
```

Environment-dependent values are loaded from environment variables and the project's `.env` file.

This keeps credentials, database configuration, API keys and other environment-specific settings outside the source code.

**Environment configuration:**

- `.env` contains your actual local configuration and must never be committed to Git.
- `.env.example` documents the required environment variables and serves as a template.
- Production uses its own environment variables, separate from local development.

The same application code can run locally and in production without manually changing configuration values.

---

# 🔍 Hybrid Search

The application combines traditional keyword search with semantic vector search.

```text
              User Query
                  │
          ┌───────┴───────┐
          ▼               ▼
     PostgreSQL        ChromaDB
    Keyword Search    Semantic Search
          │               │
          └───────┬───────┘
                  ▼
             Results Merged
                  │
                  ▼
            Products Returned
```

Semantic search uses embeddings to find relevant products based on meaning, even when the exact search terms do not appear in product names.

---

# 💳 PayPal Sandbox

The application integrates PayPal Sandbox to test payments without using real money.

```text
Add products to cart
        │
        ▼
      Checkout
        │
        ▼
  Reserve Stock
        │
        ▼
 Create Pending Order
        │
        ▼
Create PayPal payment
        │
        ▼
  PayPal Sandbox
        │
        ▼
 User approves payment
        │
        ▼
Backend processes payment
        │
        ▼
Payment Completed Event
        │
        ▼
   ┌────┼───────────────┐
   ▼    ▼               ▼
Update  Clear        Send Payment
Stock   Cart         Confirmation
        Email
         │
         └───────┬───────┘
                 ▼
          Order / Payment Flow
```

Before payment, the application reserves the required inventory using atomic database operations.

The order remains in a `pending` state while the customer completes payment. A reservation expiration time is stored with the order so that unpaid orders can eventually release their reserved inventory.

After successful payment, a `payment.completed` event is published. Multiple independent event handlers react to this event to update stock, clear the cart and initiate the payment confirmation email.

---

# 📦 Stock Reservation & Concurrency

The application prevents multiple customers from purchasing more inventory than is available.

When a customer checks out, stock is reserved before the PayPal payment flow continues.

The reservation uses an atomic database update:

```sql
UPDATE products
SET stock = stock - :quantity
WHERE id = :product_id
  AND stock >= :quantity;
```

This means the stock check and stock decrease happen as one database operation.

For example, if a product has 1 item remaining:

```text
Customer A → reserves 1 → success → stock becomes 0
Customer B → tries to reserve 1 → fails
```

If there are 10 items available, multiple customers can successfully reserve stock concurrently as long as enough inventory remains.

Orders receive a reservation expiration time. If payment is not completed before the reservation expires, the background worker releases the reserved stock and marks the order as expired.

This prevents unpaid orders from permanently holding inventory.

---

# 🔄 Order Reservation Flow

```text
Customer Checkout
       │
       ▼
Check Cart
       │
       ▼
Atomic Stock Reservation
       │
       ▼
Create Pending Order
       │
       ▼
Commit Transaction
       │
       ▼
Create / Redirect to PayPal
       │
       ├───────────────┐
       │               │
       ▼               ▼
   Payment          Reservation
   succeeds         expires
       │               │
       ▼               ▼
    Paid            Expired
       │               │
       │               ▼
       │         Restore Stock
       │
       ▼
Payment Completed Event
       │
       ├───────────────┐
       ▼               ▼
   Clear Cart      Send Email
```

Stock is reserved before the PayPal redirect so that a customer does not complete payment only to discover that another customer already purchased the remaining inventory.

Atomic transactions ensure that the stock reservation and order creation are handled consistently.

---

# 📧 Background Email Processing

Email notifications are processed through a dedicated **background worker** rather than making the main API request wait for email delivery.

When an email needs to be sent, the application creates an email job that can be processed independently by the background worker.

```text
Payment Completed Event
          │
          ▼
   Email Event Handler
          │
          ▼
       Email Job
          │
          ▼
 Background Email Worker
          │
          ▼
     Email Service
          │
          ▼
   Confirmation Email
```

This allows the API and event handlers to continue processing without waiting for the email service to complete.

The background worker is used for tasks such as sending payment confirmation emails and checking for expired order reservations.

---

# 🛡️ Rate Limiting

The application includes global API rate limiting to protect against excessive traffic and accidental request floods.

### Global Limits

| Limit | Maximum | Window |
|---|---:|---|
| Per user | 60 requests | 1 minute |
| Per IP address | 300 requests | 1 minute |

### Login Limits

| Limit | Maximum | Window |
|---|---:|---|
| Per email | 5 attempts | 15 minutes |
| Per IP address | 50 attempts | 15 minutes |

These settings are managed through centralized application configuration.

When a rate limit is exceeded, the API returns `429 Too Many Requests`, which the frontend handles with a dedicated error page.

---

# ⚠️ Error Handling

The frontend handles common API failures with dedicated user-friendly error states.

- **401 Unauthorized:** Handles authentication failures and redirects when required.
- **429 Too Many Requests:** Displays a rate-limit page.
- **500, 502, 503:** Displays a server error page with an option to retry.
- **Network errors:** Displays a connection error instead of an unhandled browser error.

---

# 🎨 Frontend

The React frontend uses a neon-glass cyber aesthetic.

It includes:

- Product and category pages
- Shopping cart and checkout
- Authentication and user profiles
- Order history
- Admin dashboard
- Payment integration
- Dedicated error pages

---

# 👨‍💼 Admin Panel

Newly registered users are not administrators by default.

To promote a user, connect to PostgreSQL:

```bash
docker compose exec postgres psql -U postgres -d fastapi_app6
```

Then execute:

```sql
UPDATE users
SET is_admin = TRUE
WHERE id = 1;
```

The admin panel provides product, category and order management.

---

# 🐳 Running the Application Locally

Make sure **Git**, **Docker Desktop** and **Docker Compose** are installed.

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd e-commerce_app
```

### 2. Create your environment file

The repository includes `.env.example`, which contains the required environment variable names without exposing private credentials.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**

```bash
cp .env.example .env
```

### 3. Configure your environment variables

Open `.env` and provide your own configuration and credentials, including any required:

- PostgreSQL settings
- Application secret key
- PayPal Sandbox client ID and secret
- PayPal success and cancel URLs
- Email credentials
- External API keys

Never commit your actual `.env` file or private credentials to GitHub.

### 4. Build and start the application

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

The two Compose files are merged:

- `docker-compose.yml` contains the shared application and infrastructure configuration.
- `docker-compose.local.yml` contains local development settings and overrides.

Docker Compose builds and starts the application services:

- FastAPI backend
- React frontend
- PostgreSQL
- Redis
- Background email worker
- ChromaDB
- Ollama

### 5. Access the application

Use the ports configured in `docker-compose.local.yml`.

| Service | Default development URL |
|---|---|
| Frontend | Check local Compose port mapping |
| Backend API | http://localhost:8000 |

### 6. Stop the application

Press `Ctrl + C` or run:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml down
```

This stops and removes the containers but normally preserves persistent database volumes.

**Note:** Avoid `docker compose down -v` unless you intentionally want to delete persistent volumes and their data.

---

# 🧪 Automated Testing & CI

The backend test suite is located in:

```text
src/tests/
├── auth/
├── cart/
├── catalog/
├── order/
├── payment/
├── search/
├── admin/
└── ...
```

Tests cover authentication, carts, catalog operations, orders, payments, search and administrative functionality.

### GitHub Actions

The project uses GitHub Actions for Continuous Integration.

Whenever changes are pushed or a Pull Request is created, GitHub Actions installs dependencies and runs:

```bash
cd src && pytest tests -q
```

Workflow configuration:

```text
.github/workflows/backend.yml
```

---

# 📁 Project Structure

```text
e-commerce-app/
├── .github/
│   └── workflows/
│       └── backend.yml
├── src/
│   ├── auth/
│   ├── admin/
│   ├── cart/
│   ├── catalog/
│   ├── order/
│   ├── payment/
│   ├── search/
│   ├── notifications/
│   ├── core/
│   └── tests/
├── frontend/
├── alembic/
├── chroma_data/
├── docker-compose.yml
├── docker-compose.local.yml
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── .env.example
├── .gitignore
└── README.md
```

---

# 🚀 Deployment

The application is containerized and can be deployed to environments supporting Docker.

Potential deployment environments include:

- AWS
- Docker servers
- VPS infrastructure
- Cloud environments
- Self-hosted servers

The same application code can be used locally and in production. Environment-specific settings, such as database credentials, PayPal URLs and secret keys, are supplied separately for each environment.

The production environment should use its own secure environment variables rather than the local development `.env`.

---

# 🛠️ Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- ChromaDB
- Pytest
- GitHub Actions

### Frontend

- React

### Payments

- PayPal Sandbox

### Architecture

- Domain-Driven Design (DDD)
- Event-Driven Architecture (EDA)
- Atomic database transactions

### Infrastructure

- Docker
- Docker Compose
- Alembic
- Ollama
- Background Email Worker

---

# 🎯 Project Overview

This project combines several backend and full-stack engineering concepts into one complete e-commerce application.

```text
React Frontend
      │
      ▼
  FastAPI Backend
      │
      ├── DDD Architecture
      ├── Event-Driven Architecture
      ├── Authentication
      ├── Rate Limiting
      ├── Orders
      ├── Payments
      ├── Stock Reservation
      ├── Atomic Transactions
      ├── Hybrid Search
      └── Admin
      │
      ▼
 Infrastructure
      ├── PostgreSQL
      ├── Redis
      ├── ChromaDB
      ├── Ollama
      └── Background Email Worker
```

The result is a containerized e-commerce application featuring **DDD architecture, Event-Driven Architecture, hybrid search, PayPal Sandbox payments, centralized configuration, atomic database transactions, request protection, background email processing, automated testing and a full React frontend**.
