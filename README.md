E‑Commerce App — Hybrid Search, DDD, PayPal Sandbox
A modern e‑commerce application built with Domain‑Driven Design (DDD), a hybrid search engine (Postgres keyword search + ChromaDB vector embeddings), and PayPal sandbox payments.
Includes a full admin panel, product management, category management, cart, orders, and email notifications.

📁 Project Structure
Code
/src        → Backend (FastAPI, DDD architecture)
/frontend   → Frontend (React + Neon‑Glass UI)
/docker     → Docker configs
Backend (src/)
Organized using Domain‑Driven Design:

domain/ — entities, value objects, repository interfaces

application/ — use cases

infrastructure/ — database, email worker, repositories

presentation/ — FastAPI routes

Frontend (frontend/)
React application with:

Product pages

Category pages

Cart

Orders

Admin dashboard

Neon‑glass cyber UI aesthetic

🔍 Hybrid Search (Keywords + Embeddings)
Search combines:

Postgres keyword search

ChromaDB vector embeddings for semantic search

This allows users to find products even with fuzzy or descriptive queries.

💳 PayPal Sandbox Payments
Checkout uses PayPal sandbox mode, allowing safe test payments without real money.

🛠 Starting the App (Docker Compose)
Make sure Docker is installed, then run:

Code
docker compose up --build
This starts:

Backend

Frontend

Postgres

Redis

Worker

ChromaDB

The app becomes available at:

Code
http://localhost:3000   → Frontend
http://localhost:8000   → Backend API
🔐 Accessing the Admin Panel
By default, no user is an admin.
To promote yourself:

1️⃣ Enter Postgres inside Docker
Code
docker compose exec postgres psql -U postgres -d your_db
2️⃣ Set your user as admin
Code
UPDATE users SET is_admin = TRUE WHERE id = 1;
3️⃣ Open the admin panel
Code
http://localhost:3000/admin
You now have access to:

Product management

Category management

Order management

Admin-only tools

📦 Features
Full e‑commerce flow

Hybrid search engine

PayPal sandbox payments

Cart + order system

Email worker (SMTP)

Admin dashboard

DDD backend architecture

Neon‑glass UI

🚀 Ready for Deployment
The project is fully containerized and can be deployed to:

Docker servers

VPS

Kubernetes

Render / Railway / Fly.io
