# 🛒 E-Commerce App — DDD, Hybrid Search & PayPal Sandbox

A full-stack e-commerce application built with **Domain-Driven Design (DDD)**, hybrid product search, PayPal Sandbox payments, centralized configuration, rate limiting, automated testing, and a neon-glass cyber UI.

## ✨ Features

- 🛍️ Complete shopping experience with products, categories, carts and orders
- 🔍 Hybrid search combining PostgreSQL keyword search and ChromaDB semantic search
- 💳 PayPal Sandbox payment integration
- 🔐 Authentication and session management
- 👨‍💼 Admin panel with product, category and order management
- 📧 Email notifications and background processing
- 🛡️ Global API and login-specific rate limiting
- ⚠️ User-friendly error handling
- ⚙️ Centralized application configuration
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
    Order created
        │
        ▼
  Payment recorded
```

The application also tracks payment information through the backend.

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
docker compose exec postgres psql -U postgres -d your_db
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
- Background worker
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

### Infrastructure
- Docker
- Docker Compose
- Alembic
- Ollama

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
      ├── Authentication
      ├── Rate Limiting
      ├── Orders
      ├── Payments
      ├── Hybrid Search
      └── Admin
      │
      ▼
 Infrastructure
      ├── PostgreSQL
      ├── Redis
      ├── ChromaDB
      ├── Ollama
      └── Background Worker
```

The result is a containerized e-commerce application featuring **DDD architecture, hybrid search, PayPal Sandbox payments, centralized configuration, request protection, background processing, automated testing and a full React frontend**.
