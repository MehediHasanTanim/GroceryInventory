# Inventory Management System - Microservices

A production-ready grocery store inventory management system built with **FastAPI**, following **Clean Architecture** principles and a **Microservices** design.

## 🚀 Architecture Overview

The system is split into independent services communicating via REST APIs:

- **Auth Service**: User registration, JWT-based authentication, and Role-Based Access Control (RBAC).
- **Inventory Service**: Product management, categorisation, and real-time stock tracking.
- **Supplier Service**: Supplier management and product-to-supplier link management.
- **Sales Service**: Records sales transactions, handles stock deductions via inter-service calls, and supports "voiding" sales.
- **Common**: Shared domain logic, database utilities, security decorators, and logging configuration.

### Core Technologies

- **Backend**: Python 3.11, FastAPI
- **Database**: PostgreSQL (Multi-database setup)
- **ORM & Migrations**: SQLAlchemy 2.0, Alembic
- **Patterns**: Repository Pattern, Unit of Work (UoW), DTOs, Clean Architecture
- **DevOps**: Docker & Docker Compose

---

## 🛠 Prerequisites

Ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## 🏃 Getting Started

### 1. Setup Environment

Copy the example environment file and configure your secrets:

```bash
cp .env.example .env
```

*Note: The default values in `.env.example` are pre-configured for a local Docker development environment.*

### 2. Build and Start Services

Run the following command to build the images and start the entire stack:

```bash
docker compose up -d --build
```

### 3. Verify Services

Check the status of the containers:

```bash
docker compose ps
```

Services will be available at:

- **Inventory Service**: `http://localhost:8000`
- **Supplier Service**: `http://localhost:8001`
- **Sales Service**: `http://localhost:8002`
- **Auth Service**: `http://localhost:8003`

---

## 📖 API Documentation

Each service provides an interactive Swagger UI:

- Inventory: `http://localhost:8000/docs`
- Supplier: `http://localhost:8001/docs`
- Sales: `http://localhost:8002/docs`
- Auth: `http://localhost:8003/docs`

### Authentication Flow

1. **Register**: `POST /api/v1/register` (Auth Service) - *Restricted to Admin only.*
2. **Login**: `POST /api/v1/login` or `POST /api/v1/token` to get your JWT.
3. **Authorize**: Include the token in the Header: `Authorization: Bearer <your_token>`

#### Admin Credentials

An initial admin user is created by default:

- **Username**: `admin`
- **Password**: `AdminPassword123!`
- **Role**: `admin`

If you need to create the admin user manually, run:

```bash
docker compose exec auth_service python scripts/create_admin.py
```

---

## 📊 Database Management

The system uses separate databases for each service.

### Running Migrations

Migrations are managed via **Alembic**. To apply migrations:

```bash
# Example for Inventory Service
docker compose exec inventory_service alembic upgrade head
```

### Creating New Migrations

```bash
docker compose exec <service_name> alembic revision --autogenerate -m "description"
```

---

## 📂 Logs & Monitoring

Logs are centrally managed and persistent.

- **Location**: `./logs` (on host) or `/app/logs` (in container).
- **Structure**: Grouped into daily directories: `logs/YYYY-MM-DD/service_name.log`.
- **Rotation**: Individual log files rotate at **10MB**.
- **Retention**: Old log directories are automatically purged after **7 days**.

---

## 🧪 Development Commands

**Rebuild a single service:**

```bash
docker compose build <service_name> && docker compose up -d <service_name>
```

**View logs in real-time:**

```bash
docker compose logs -f <service_name>
```

**Stop all services:**

```bash
docker compose down
```
