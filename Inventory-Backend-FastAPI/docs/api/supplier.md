# Supplier Service API Documentation

Manages supplier relationships and catalogues.

**Base URL**: `http://localhost:8001/api/v1`

---

## 1. Create Supplier

Register a new supplier in the system.

- **URL**: `/suppliers`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`

### Request Body

```json
{
  "name": "Global Foods Inc.",
  "contact_email": "supply@globalfoods.com",
  "phone": "+1-555-0199",
  "address": "123 Supply Lane, Logistics City"
}
```

### Sample Response (201 Created)

```json
{
  "id": "sup-111",
  "name": "Global Foods Inc.",
  "contact_email": "supply@globalfoods.com",
  "phone": "+1-555-0199",
  "address": "123 Supply Lane, Logistics City",
  "products": []
}
```

---

## 2. Get Supplier Details

Retrieve information about a specific supplier and the list of product IDs they supply.

- **URL**: `/suppliers/{supplier_id}`
- **Method**: `GET`

### Sample Response (200 OK)

```json
{
  "id": "sup-111",
  "name": "Global Foods Inc.",
  "contact_email": "supply@globalfoods.com",
  "phone": "+1-555-0199",
  "address": "123 Supply Lane, Logistics City",
  "products": ["prod-456", "prod-789"]
}
```

---

## 3. Link Product to Supplier

Associate a product from the Inventory service with this supplier.

- **URL**: `/suppliers/{supplier_id}/products`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`

### Request Body

```json
{
  "product_id": "prod-456"
}
```

### Sample Response (200 OK)

```json
{
  "id": "sup-111",
  "name": "Global Foods Inc.",
  "contact_email": "supply@globalfoods.com",
  "phone": "+1-555-0199",
  "address": "123 Supply Lane, Logistics City",
  "products": ["prod-456"]
}
```
