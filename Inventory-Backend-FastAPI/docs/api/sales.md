# Sales Service API Documentation

Processes customer transactions and automatically updates inventory stock levels.

**Base URL**: `http://localhost:8002/api/v1`

---

## 1. Record a Sale

Record a new transaction. This request triggers an update to the Inventory service to decrement stock levels.

- **URL**: `/sales`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`

### Request Body

```json
{
  "items": [
    {
      "product_id": "prod-456",
      "quantity": 2,
      "price": 3.99
    }
  ]
}
```

### Sample Response (201 Created)

```json
{
  "id": "sale-999",
  "total_amount": 7.98,
  "status": "completed",
  "timestamp": "2026-02-13T21:45:00Z",
  "items": [
    {
      "product_id": "prod-456",
      "quantity": 2,
      "price_at_sale": 3.99
    }
  ]
}
```

---

## 2. Get Sale Details

Retrieve historical data for a specific transaction.

- **URL**: `/sales/{sale_id}`
- **Method**: `GET`

### Sample Response (200 OK)

```json
{
  "id": "sale-999",
  "total_amount": 7.98,
  "status": "completed",
  "timestamp": "2026-02-13T21:45:00Z",
  "items": [
    {
      "product_id": "prod-456",
      "quantity": 2,
      "price_at_sale": 3.99
    }
  ]
}
```

---

## 3. Void a Sale (Admin Only)

Cancel a sale and automatically restore physical stock to the inventory.

- **URL**: `/sales/{sale_id}/void`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <admin_token>`

### Sample Response (200 OK)

```json
{
  "id": "sale-999",
  "total_amount": 7.98,
  "status": "voided",
  "timestamp": "2026-02-13T21:45:00Z",
  "items": [
    {
      "product_id": "prod-456",
      "quantity": 2,
      "price_at_sale": 3.99
    }
  ]
}
```
