# 🛒 E-Commerce App — DDD, Hybrid Search & PayPal Sandbox

A modern, full-stack e-commerce application built with **Domain-Driven Design (DDD)**, a **hybrid search engine**, and **PayPal Sandbox** payments.

The application includes a complete shopping flow with products, categories, carts, orders, payments, email notifications, and an admin panel. The backend is fully containerized and supported by automated CI testing.

---

## ✨ Features

* 🛍️ Full e-commerce shopping flow
* 🔍 Hybrid product search
* 🧠 Semantic search using vector embeddings
* 🗄️ PostgreSQL keyword search
* 🧮 ChromaDB vector database
* 💳 PayPal Sandbox payments
* 🛒 Shopping cart
* 📦 Order management
* 📧 Email notifications and background worker
* 👨‍💼 Admin panel
* 🏷️ Product and category management
* 🏗️ Domain-Driven Design backend architecture
* 🎨 Neon-glass cyber UI
* 🐳 Fully containerized with Docker Compose
* ✅ Automated CI testing with GitHub Actions

---

# 🏗️ Architecture

The backend is organized using **Domain-Driven Design (DDD)** principles.

domain/
├── application/
│   ├── dto/
│   ├── use_cases/
│   └── __init__.py
│
├── domain/
│   ├── entities/
│   ├── interfaces/
│   ├── rules/
│   ├── services/
│   └── __init__.py
│
├── infrastructure/
│   ├── db/
│   ├── helpers/
│   ├── repositories/
│   └── __init__.py
│
├── routes/
│   ├── __init__.py
│   └── auth_routes.py
│
└── ...

### Domain

Contains the core business logic, entities, value objects, and repository interfaces.

### Application

Contains the application's use cases and coordinates business operations.

### Infrastructure

Handles external concerns such as:

* PostgreSQL
* ChromaDB
* Redis
* Email
* Repository implementations
* Background workers

### Presentation

Contains the FastAPI API routes and HTTP-related functionality.

---

# 🎨 Frontend

The frontend is built with **React** and uses a neon-glass cyber aesthetic.

It includes:

* 🏠 Product pages
* 🏷️ Category pages
* 🛒 Shopping cart
* 📦 Orders
* 👨‍💼 Admin dashboard
* 🔐 Authentication
* 💳 Checkout

---

# 🔍 Hybrid Search

The application uses a hybrid search system combining **keyword search** and **semantic vector search**.

### How it works

```text
User query
    │
    ├── PostgreSQL keyword search
    │
    └── ChromaDB semantic search
             │
             ▼
       Results are merged
             │
             ▼
       Products returned
```

The semantic search uses **embeddings** to find products based on meaning rather than only exact keywords.

For example, a descriptive query can potentially find relevant products even when the exact product name is not present in the search.

---

# 💳 PayPal Sandbox

Checkout uses **PayPal Sandbox**, allowing payments to be tested without using real money.

The application integrates PayPal into the checkout flow and tracks payment information through the backend.

---

# 🐳 Running the Application

Make sure **Docker** and **Docker Compose** are installed.

Clone the repository and run:

```bash
docker compose up --build
```

Docker Compose starts the application's required services:

```text
Backend
Frontend
PostgreSQL
Redis
Email Worker
ChromaDB
Ollama
```

Once the containers are running:

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:3000 |
| Backend API | http://localhost:8000 |

---

# 🔐 Admin Panel

By default, newly registered users are **not administrators**.

To promote a user to administrator, enter the PostgreSQL container:

```bash
docker compose exec postgres psql -U postgres -d your_db
```

Then run:

```sql
UPDATE users
SET is_admin = TRUE
WHERE id = 1;
```

After that, open:

```text
http://localhost:3000/admin
```

The admin panel provides tools for:

* 📦 Product management
* 🏷️ Category management
* 📋 Order management
* 🔧 Admin-only operations

---

# 🧪 Automated Testing & CI

The project includes a comprehensive automated test suite located in:

```text
src/tests/
```

The tests cover different parts of the backend, including:

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

The project also uses **GitHub Actions for Continuous Integration (CI)**.

Whenever changes are pushed to the repository or a Pull Request is created, GitHub Actions automatically installs the project dependencies and runs:

```bash
cd src && pytest tests -q
```

This means the backend test suite is automatically executed in CI whenever the project is pushed.

### CI workflow

```text
Git push / Pull Request
        │
        ▼
GitHub Actions
        │
        ▼
Install dependencies
        │
        ▼
Run src/tests
        │
        ├── ✅ All tests pass
        │
        └── ❌ A test fails → CI check fails
```

The CI configuration can be found at:

```text
.github/workflows/backend.yml
```

---

# 📁 Project Structure

```text
e-commerce-app/
│
├── .github/
│   └── workflows/
│       └── backend.yml
│
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
│
├── frontend/
│
├── alembic/
│
├── chroma_data/
│
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── .env.example
└── README.md
```

---

# 🚀 Deployment

The application is fully containerized and can be deployed to environments capable of running Docker containers.

Potential deployment environments include:

* Docker servers
* VPS infrastructure
* Cloud environments supporting Docker
* Self-hosted servers

---

## 🛠️ Tech Stack

### Backend

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **PostgreSQL**
* **Redis**
* **ChromaDB**
* **Pytest**
* **GitHub Actions**

### Frontend

* **React**

### Payments

* **PayPal Sandbox**

### Infrastructure

* **Docker**
* **Docker Compose**
* **Alembic**

---

# 📌 Project Highlights

This project combines several backend concepts into one application:

**Domain-Driven Design** for organizing business logic,
**hybrid search** for combining keyword and semantic search,
**PayPal Sandbox** for payment integration,
**Redis and background workers** for asynchronous tasks,
**Docker Compose** for local infrastructure, and
**GitHub Actions CI** for automatically running the backend test suite on every push and Pull Request.
