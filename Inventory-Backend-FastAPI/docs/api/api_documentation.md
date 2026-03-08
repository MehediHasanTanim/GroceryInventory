# API Documentation

This document provides a comprehensive list of all available API endpoints across the microservices. All microservices follow a RESTful architectural style and use JSON for data exchange.

## 📁 Service-Specific Documentation

Detailed documentation for each service, including sample URLs, headers, request bodies, and responses:

* [**Auth Service API**](docs/api/auth.md)
* [**Inventory Service API**](docs/api/inventory.md)
* [**Sales Service API**](docs/api/sales.md)
* [**Supplier Service API**](docs/api/supplier.md)

---

## 🔐 Base URL Prefix

All endpoints for each service are prefixed with `/api/v1` as defined in their respective `main.py` files.

* **Auth Service**: `http://localhost:8003/api/v1`
* **Inventory Service**: `http://localhost:8000/api/v1`
* **Sales Service**: `http://localhost:8002/api/v1`
* **Supplier Service**: `http://localhost:8001/api/v1`

---

## 1. Auth Service

Handles user creation, login, and JWT token issuance.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Create a new user account | None |
| `POST` | `/token` | Obtain access token (OAuth2 Password Grant) | None |
| `POST` | `/login` | Obtain access token (JSON Body) | None |

---

## 2. Inventory Service

Manages product categories, products, and inventory levels.

### Category Management

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/categories` | Create a new product category | **Admin** |
| `GET` | `/categories` | List all product categories | None |
| `GET` | `/categories/{id}` | Get specific category details | None |

### Product & Stock Management

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/products` | Create a new product | None |
| `GET` | `/products` | List all products | None |
| `GET` | `/products/{id}` | Get specific product details (incl. Stock) | None |
| `POST` | `/products/{id}/stock` | Update stock quantity (increment/decrement) | None |

---

## 3. Sales Service

Records and retrieves sales transaction data.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/sales` | Record a new sale and update inventory stock | None |
| `GET` | `/sales/{id}` | Retrieve specific sale details | None |

---

## 4. Supplier Service

Manages supplier information and product-supplier links.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/suppliers` | Register a new supplier | None |
| `GET` | `/suppliers/{id}` | Get specific supplier details | None |
| `POST` | `/suppliers/{id}/products` | Link an existing product to this supplier | None |

---

## 🏗 Authorization Headers

For endpoints requiring authentication (e.g., Category Creation), include the JWT token in the request header:

```http
Authorization: Bearer <your_access_token>
```

---

## ⚡ Error Responses

All services return standardized error objects in case of failures:

```json
{
  "detail": "Descriptive error message here"
}
```

* `400 Bad Request`: Validation errors or business logic violations.
* `401 Unauthorized`: Missing or invalid authentication token.
* `403 Forbidden`: Insufficient permissions (role mismatch).
* `404 Not Found`: Resource does not exist.
* `500 Internal Server Error`: Unexpected server-side failure.
