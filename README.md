# 🛒 E-Commerce App — DDD, Hybrid Search & PayPal Sandbox

A modern, full-stack e-commerce application built with **Domain-Driven Design (DDD)**, a **hybrid search engine**, **PayPal Sandbox** payments, centralized configuration, rate limiting, automated testing, and a neon-glass cyber UI.

The application provides a complete shopping experience including products, categories, shopping carts, orders, payments, email notifications, search, authentication, and an admin panel.

---

# ✨ Features

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
* 🔐 Authentication and session management
* 🛡️ Global API rate limiting
* 🚦 Login-specific rate limiting
* ⚠️ User-friendly error pages
* ⚙️ Centralized application configuration
* 🏗️ Domain-Driven Design backend architecture
* 🎨 Neon-glass cyber UI
* 🐳 Fully containerized with Docker Compose
* ✅ Automated CI testing with GitHub Actions

---

# 🏗️ Architecture

The backend follows **Domain-Driven Design (DDD)** principles to separate business logic from infrastructure and presentation concerns.

```text
src/
│
├── application/
│   ├── dto/
│   ├── use_cases/
│   └── ...
│
├── domain/
│   ├── entities/
│   ├── interfaces/
│   ├── rules/
│   ├── services/
│   └── ...
│
├── infrastructure/
│   ├── db/
│   ├── helpers/
│   ├── repositories/
│   └── ...
│
├── routes/
│   └── ...
│
└── core/
    └── config.py
```

### Domain

Contains the core business logic of the application, including:

* Domain entities
* Business rules
* Domain services
* Repository interfaces

The domain layer is kept independent from external infrastructure wherever possible.

### Application

Contains the application's use cases and coordinates operations between the domain and infrastructure layers.

Examples include:

* User registration
* Login and authentication
* Cart operations
* Order creation
* Payment processing
* Product management

### Infrastructure

Handles external technologies and services such as:

* PostgreSQL
* SQLAlchemy
* Redis
* ChromaDB
* Email services
* Background workers
* Repository implementations

### Presentation

The FastAPI routes provide the HTTP API and connect incoming requests with the application's use cases.

---

# ⚙️ Centralized Configuration

Application settings are centralized in:

```text
core.config.settings
```

This provides a single place where many application settings can be configured and adjusted.

For example, settings related to:

* Rate limits
* Authentication
* Application behavior
* Database configuration
* External services
* Other environment-dependent options

can be managed through the application's central settings.

The configuration also reads environment-specific information from the project's:

```text
.env
```

file.

This allows sensitive or environment-dependent values such as credentials, database settings, API keys, and service configuration to remain outside the source code.

A typical setup is:

```text
.env
   │
   ▼
core.config.settings
   │
   ▼
Application
```

This makes it easier to change application behavior without having to modify code throughout the project.

> **Note:** Never commit your real `.env` file or sensitive credentials to Git. Use `.env.example` as a template for required environment variables.

---

# 🛡️ Rate Limiting

The application includes **global rate limiting for API requests** to help protect the backend from excessive traffic and accidental request floods.

## 🌐 Global Rate Limits

The global limits are:

| Limit          |          Maximum |   Window |
| -------------- | ---------------: | -------: |
| Per user       |  **60 requests** | 1 minute |
| Per IP address | **300 requests** | 1 minute |

These limits apply globally across the application's requests.

The limits can be adjusted through the application's centralized configuration in:

```text
core.config.settings
```

When a client exceeds a rate limit, the API returns:

```text
HTTP 429 Too Many Requests
```

The frontend handles these responses and displays a dedicated **Too Many Requests** error page instead of leaving the user with a generic browser or network error.

---

# 🔐 Login Rate Limiting

Login attempts have additional protection against repeated authentication attempts.

The login endpoint uses separate limits:

| Limit          |         Maximum |     Window |
| -------------- | --------------: | ---------: |
| Per email      |  **5 attempts** | 15 minutes |
| Per IP address | **50 attempts** | 15 minutes |

This provides an additional layer of protection specifically around authentication while still allowing legitimate users to log in normally.

These settings can also be adjusted through:

```text
core.config.settings
```

---

# ⚠️ Error Handling

The application has frontend handling for common API failures.

Instead of exposing raw backend errors to users, the frontend displays dedicated error states.

Examples include:

### Too Many Requests

When the API returns:

```text
429 Too Many Requests
```

the application displays a dedicated rate-limit page explaining that the user should wait before trying again.

### Server Errors

For errors such as:

```text
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

the frontend displays a user-friendly error page with an option to try again.

### Authentication Errors

If an API request returns:

```text
401 Unauthorized
```

the application can redirect the user to the login page when authentication is required.

### Network Errors

If the frontend cannot communicate with the backend, it displays a connection/error state rather than simply showing an unhandled browser error.

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
* ⚠️ User-friendly error handling
* 🚦 Rate-limit error screens

The interface communicates important backend errors to the user instead of exposing raw API responses.

---

# 🔍 Hybrid Search

The application uses a hybrid search system combining **traditional keyword search** with **semantic vector search**.

### Search Flow

```text
                 User Query
                     │
             ┌───────┴───────┐
             │               │
             ▼               ▼
      PostgreSQL         ChromaDB
      Keyword Search   Semantic Search
             │               │
             └───────┬───────┘
                     ▼
              Results Merged
                     │
                     ▼
              Products Returned
```

The semantic search uses **embeddings** to find products based on meaning rather than relying only on exact keyword matches.

For example, a descriptive query can potentially find relevant products even when the exact words do not appear in the product name.

---

# 💳 PayPal Sandbox

The application integrates **PayPal Sandbox** for testing payments without using real money.

The checkout flow is approximately:

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

# 🛒 Shopping Flow

The application supports a complete shopping workflow:

```text
Browse products
      │
      ▼
Search / Categories
      │
      ▼
Product Details
      │
      ▼
Add to Cart
      │
      ▼
Checkout
      │
      ▼
PayPal Sandbox
      │
      ▼
Order Created
      │
      ▼
Order Management
```

Users can:

* Browse products
* Search for products
* View categories
* Add products to their cart
* Update cart quantities
* Checkout
* Complete payments through PayPal Sandbox
* View previous orders
* View their profile

---

# 👨‍💼 Admin Panel

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

# 🧪 Automated Testing & CI

The project includes an automated backend test suite located in:

```text
src/tests/
```

The tests are organized by application area:

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

The tests cover different parts of the backend, including authentication, carts, catalog operations, orders, payments, search, and administrative functionality.

## GitHub Actions

The project uses **GitHub Actions for Continuous Integration (CI)**.

Whenever changes are pushed to the repository or a Pull Request is created, GitHub Actions installs the required dependencies and runs:

```bash
cd src && pytest tests -q
```

### CI Workflow

```text
Git Push / Pull Request
          │
          ▼
    GitHub Actions
          │
          ▼
 Install Dependencies
          │
          ▼
      Run Tests
          │
       ┌──┴──┐
       ▼     ▼
      ✅     ❌
    Passed  Failed
```

The CI configuration is located at:

```text
.github/workflows/backend.yml
```

This helps ensure that backend changes are automatically tested before they are merged.

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

The Docker-based architecture makes it possible to run the application consistently across development and deployment environments.

---

# 🛠️ Tech Stack

## Backend

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **PostgreSQL**
* **Redis**
* **ChromaDB**
* **Pytest**
* **GitHub Actions**

## Frontend

* **React**

## Payments

* **PayPal Sandbox**

## Infrastructure

* **Docker**
* **Docker Compose**
* **Alembic**

---

# 📌 Project Highlights

This project combines multiple backend and full-stack concepts into one application:

### 🏗️ Domain-Driven Design

The backend separates domain logic, application use cases, infrastructure, and presentation concerns.

### 🔍 Hybrid Search

Keyword-based PostgreSQL search is combined with semantic vector search through ChromaDB.

### 💳 Payment Integration

PayPal Sandbox provides a realistic payment workflow without processing real payments.

### 🛡️ Request Protection

Global rate limiting provides:

* **60 requests/minute per user**
* **300 requests/minute per IP**

Login-specific protection provides:

* **5 attempts/15 minutes per email**
* **50 attempts/15 minutes per IP**

### ⚠️ Error Handling

The frontend handles authentication errors, rate limits, server failures, and network problems with dedicated user-friendly error states.

### ⚙️ Centralized Configuration

Application settings are centralized through:

```text
core.config.settings
```

while environment-specific values can be supplied through:

```text
.env
```

This makes it straightforward to adjust application behavior without searching through the entire codebase.

### 🐳 Containerized Infrastructure

Docker Compose manages the application's backend, frontend, database, Redis, ChromaDB, Ollama, and background services.

### 🧪 Automated CI

GitHub Actions automatically runs the backend test suite when changes are pushed or Pull Requests are created.

---

# 🎯 Project Overview

This application is designed as a complete full-stack e-commerce system rather than a simple CRUD application.

It combines:

```text
React
  │
  ▼
FastAPI
  │
  ├── DDD Architecture
  ├── Authentication
  ├── Rate Limiting
  ├── Orders
  ├── Payments
  ├── Search
  └── Admin
  │
  ├── PostgreSQL
  ├── Redis
  ├── ChromaDB
  ├── Ollama
  └── Background Workers
```

The result is a containerized e-commerce application with **DDD architecture, hybrid search, PayPal Sandbox payments, centralized configuration, request protection, background processing, automated testing, and a full React frontend**.
