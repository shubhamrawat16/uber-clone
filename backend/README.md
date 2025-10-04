# Backend API Documentation

## POST `/users/register`

Registers a new user in the system.

### Request Body

Send a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "yourpassword"
}
```

#### Field Requirements

- `fullname.firstname` (string, required): Minimum 3 characters.
- `fullname.lastname` (string, optional): Minimum 3 characters if provided.
- `email` (string, required): Must be a valid email address.
- `password` (string, required): Minimum 6 characters.

### Responses

- **201 Created**
  - Success. Returns a JSON object containing the authentication token and user data.
  - Example:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "64c7f2e2b8e4f2a1c8d9e123",
        "fullname": {
          "firstname": "John",
          "lastname": "Doe"
        },
        "email": "john.doe@example.com"
      }
    }
    ```

- **400 Bad Request**
  - Validation failed. Returns an array of error messages.
  - Example:
    ```json
    {
      "errors": [
        {
          "msg": "First name must be at least 3 characters long",
          "param": "fullname.firstname",
          "location": "body"
        }
      ]
    }
    ```

- **500 Internal Server Error**
  - Server error or missing required fields.

### Example Usage

```sh
curl -X POST http://localhost:4000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john.doe@example.com",
    ```

## POST `/users/login`

Authenticates a user and returns a JWT token.

### Request Body

Send a JSON object with the following structure:

```json
{
  "email": "john.doe@example.com",
  "password": "yourpassword"
}
```

#### Field Requirements

- `email` (string, required): Must be a valid email address.
- `password` (string, required): Minimum 6 characters.

### Responses

- **200 OK**
  - Success. Returns a JSON object containing the authentication token and user data.
  - Example:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "64c7f2e2b8e4f2a1c8d9e123",
        "fullname": {
          "firstname": "John",
          "lastname": "Doe"
        },
        "email": "john.doe@example.com"
      }
    }
    ```

- **400 Bad Request**
  - Validation failed. Returns an array of error messages.
  - Example:
    ```json
    {
      "errors": [
        {
          "msg": "Please enter a valid email address",
          "param": "email",
          "location": "body"
        }
      ]
    }
    ```

- **401 Unauthorized**
  - Invalid email or password.
  - Example:
    ```json
    {
      "message": "Invalid email or password"
    }
    ```

### Example Usage

```sh
curl -X POST http://localhost:4000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    ```

## GET `/users/profile`

Returns the authenticated user's profile information.

### Authentication

- Requires a valid JWT token in the `Authorization` header or as a cookie.

### Responses

- **200 OK**
  - Success. Returns a JSON object containing the user's profile.
  - Example:
    ```json
    {
      "_id": "64c7f2e2b8e4f2a1c8d9e123",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
    }
    ```

- **401 Unauthorized**
  - Missing or invalid token.
  - Example:
    ```json
    {
      "message": "Authentication required"
    }
    ```

### Example Usage

```sh
curl -X GET http://localhost:4000/users/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## GET `/users/logout`

Logs out the authenticated user by blacklisting the JWT token and clearing the cookie.

### Authentication

- Requires a valid JWT token in the `Authorization` header or as a cookie.

### Responses

- **200 OK**
  - Success. Returns a message confirming logout.
  - Example:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```

- **401 Unauthorized**
  - Missing or invalid token.
  - Example:
    ```json
    {
      "message": "Authentication required"
    }
    ```

### Example Usage

```sh
curl -X GET http://localhost:4000/users/logout \
  -H "Authorization: Bearer <your_jwt_token>"
```

## POST `/captains/register`

Registers a new captain (driver) with vehicle details.

### Request Body

Send a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "Alice",
    "lastname": "Smith"
  },
  "email": "alice.smith@example.com",
  "password": "yourpassword",
  "vehicle": {
    "color": "Red",
    "plate": "ABC1234",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

#### Field Requirements

- `fullname.firstname` (string, required): Minimum 3 characters.
- `fullname.lastname` (string, optional): Minimum 3 characters if provided.
- `email` (string, required): Must be a valid email address.
- `password` (string, required): Minimum 6 characters.
- `vehicle.color` (string, required): Minimum 3 characters.
- `vehicle.plate` (string, required): Minimum 3 characters.
- `vehicle.capacity` (integer, required): Minimum value 1.
- `vehicle.vehicleType` (string, required): Must be one of: `car`, `bike`, `auto`.

### Responses

- **201 Created**
  - Success. Returns a JSON object containing the captain's data.
  - Example:
    ```json
    {
      "_id": "64c7f2e2b8e4f2a1c8d9e456",
      "fullname": {
        "firstname": "Alice",
        "lastname": "Smith"
      },
      "email": "alice.smith@example.com",
      "vehicle": {
        "color": "Red",
        "plate": "ABC1234",
        "capacity": 4,
        "vehicleType": "car"
      }
    }
    ```

- **400 Bad Request**
  - Validation failed. Returns an array of error messages.
  - Example:
    ```json
    {
      "errors": [
        {
          "msg": "Vehicle type must be one of: car, bike, auto",
          "param": "vehicle.vehicleType",
          "location": "body"
        }
      ]
    }
    ```

- **500 Internal Server Error**
  - Server error or missing required fields.

### Example Usage

```sh
curl -X POST http://localhost:4000/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": { "firstname": "Alice", "lastname": "Smith" },
    "email": "alice.smith@example.com",
    "password": "yourpassword",
    "vehicle": {
      "color": "Red",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'
```

## Captain Routes

### POST `/captains/register`

Registers a new captain (driver) with vehicle details.

#### Request Body

```json
{
  "fullname": {
    "firstname": "Alice",      // string, required, min 3 chars
    "lastname": "Smith"        // string, optional, min 3 chars if provided
  },
  "email": "alice.smith@example.com", // string, required, valid email
  "password": "yourpassword",         // string, required, min 6 chars
  "vehicle": {
    "color": "Red",           // string, required, min 3 chars
    "plate": "ABC1234",       // string, required, min 3 chars
    "capacity": 4,            // integer, required, min 1
    "vehicleType": "car"      // string, required, one of: "car", "bike", "auto"
  }
}
```

#### Success Response (`201 Created`)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token
  "captain": {
    "_id": "64c7f2e2b8e4f2a1c8d9e456",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

#### Error Response (`400 Bad Request`)

```json
{
  "errors": [
    {
      "msg": "Vehicle type must be one of: car, bike, auto", // error message
      "param": "vehicle.vehicleType",                         // field with error
      "location": "body"
    }
  ]
}
```

---

### POST `/captains/login`

Authenticates a captain and returns a JWT token.

#### Request Body

```json
{
  "email": "alice.smith@example.com", // string, required, valid email
  "password": "yourpassword"          // string, required, min 6 chars
}
```

#### Success Response (`200 OK`)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token
  "captain": {
    "_id": "64c7f2e2b8e4f2a1c8d9e456",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

#### Error Response (`401 Unauthorized`)

```json
{
  "message": "Invalid email or password."
}
```

---

### GET `/captains/profile`

Returns the authenticated captain's profile information.

#### Success Response (`200 OK`)

```json
{
  "captain": {
    "_id": "64c7f2e2b8e4f2a1c8d9e456",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

#### Error Response (`401 Unauthorized`)

```json
{
  "message": "Authentication required"
}
```

---

### GET `/captains/logout`

Logs out the authenticated captain by blacklisting the JWT token and clearing the cookie.

#### Success Response (`200 OK`)

```json
{
  "message": "Logged out successfully."
}
```

#### Error Response (`401 Unauthorized`)

```json
{
  "message": "Authentication