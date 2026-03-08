# Inventory Service API Documentation

Manages product categories, products, and real-time stock levels.

**Base URL**: `http://localhost:8000/api/v1`

---

## 1. Create Category (Admin Only)

Define a new product category.

- **URL**: `/categories`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

### Request Body

```json
{
  "name": "Produce",
  "description": "Fresh fruits and vegetables"
}
```

### Sample Response (201 Created)

```json
{
  "id": "cat-123",
  "name": "Produce",
  "description": "Fresh fruits and vegetables"
}
```

---

## 2. List Categories

Retrieve all available categories.

- **URL**: `/categories`
- **Method**: `GET`
- **Query Params**: `limit=100`, `offset=0`

### Sample Response (200 OK)

```json
[
  {
    "id": "cat-123",
    "name": "Produce",
    "description": "Fresh fruits and vegetables"
  }
]
```

---

## 3. Create Product

Add a new product to the inventory. Creating a product automatically initializes its stock record at quantity 0.

- **URL**: `/products`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`

### Request Body

```json
{
  "name": "Organic Bananas",
  "description": "Pack of 6 organic bananas",
  "price": 3.99,
  "sku": "PROD-BAN-001",
  "category_id": "cat-123"
}
```

### Sample Response (201 Created)

```json
{
  "id": "prod-456",
  "name": "Organic Bananas",
  "description": "Pack of 6 organic bananas",
  "price": 3.99,
  "sku": "PROD-BAN-001",
  "category_id": "cat-123"
}
```

---

## 4. Get Product Details

Retrieve details for a specific product, including its current stock status.

- **URL**: `/products/{product_id}`
- **Method**: `GET`

### Sample Response (200 OK)

```json
{
  "id": "prod-456",
  "name": "Organic Bananas",
  "description": "Pack of 6 organic bananas",
  "price": 3.99,
  "sku": "PROD-BAN-001",
  "category_id": "cat-123"
}
```

---

## 5. Update Stock

Increment or decrement the stock quantity for a product.

- **URL**: `/products/{product_id}/stock`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`

### Request Body

```json
{
  "quantity_change": 50
}
```

*Note: Use negative numbers to decrement stock (e.g., `-10`).*

### Sample Response (200 OK)

```json
{
  "id": "stock-789",
  "product_id": "prod-456",
  "quantity": 50,
  "location": "Warehouse A"
}
```
