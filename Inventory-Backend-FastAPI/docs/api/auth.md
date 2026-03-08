# Auth Service API Documentation

The Auth Service handles user registration and authentication using JWT tokens.

**Base URL**: `http://localhost:8003/api/v1`

---

## 1. Register User

Create a new user account.

- **URL**: `/register`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`

### Request Body

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "strongpassword123",
  "role": "staff"
}
```

*Note: `role` can be `admin` or `staff`. Defaults to `staff`.*

### Sample Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "staff",
  "is_active": true
}
```

---

## 2. Login (OAuth2 Form)

Obtain an access token using standard OAuth2 form data. This is used by Swagger UI and standard OAuth2 clients.

- **URL**: `/token`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/x-www-form-urlencoded`

### Request Body (Form Data)

- `username`: `johndoe`
- `password`: `strongpassword123`

### Sample Response (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 3. Login (JSON)

Alternative login endpoint that accepts a JSON body.

- **URL**: `/login`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`

### Request Body

```json
{
  "username": "johndoe",
  "password": "strongpassword123"
}
```

### Sample Response (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
