## 🍕 Pizza Delivery Platform - Authentication Microservice

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0000?style=for-the-badge&logo=typeorm&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Winston](https://img.shields.io/badge/Winston-4A154B?style=for-the-badge&logo=slack&logoColor=white)

### 🔐 High-Performance Authentication & Identity Service

The **Authentication Microservice** handles user registration, login, session management, multi-tenant partitioning, and role-based access control (RBAC) for the Pizza Delivery Platform. 

It implements a modern **Asymmetric Dual-Token Architecture** using **RSA-256 (RS256)** for stateless access token verification and **HMAC-256 (HS256)** for stateful, database-backed session tracking.

> [!NOTE]
> For a detailed, comprehensive walkthrough of the system design, sequence diagrams, and database layout, please consult the [ARCHITECTURE.md](file:///e:/Hari/Desktop/Code/Pizza%20Delivery%20Platform/mernspace-c-auth-service/ARCHITECTURE.md) file.

---

## ✨ Features

*   **Asymmetric JWT Signature (`RS256`)**: Access tokens are signed using a 2048-bit RSA Private Key. Other microservices in the cluster verify client identity statelessly using public keys.
*   **Local JWKS Key Serving**: Exposes a standard JSON Web Key Set (**JWKS**) endpoint at `/.well-known/jwks.json`, enabling decentralized token verification.
*   **Dual-Token Delivery**: Cookies (`accessToken` and `refreshToken`) are sent via **HTTP-only, SameSite=Strict** cookies to protect against XSS and CSRF attacks. Also supports fallback header-based `Authorization: Bearer <token>` for API/mobile clients.
*   **Persistent Session Tracking**: DB-backed refresh tokens are registered in PostgreSQL, allowing immediate, precise session revocation (on logout or renewal).
*   **Multi-Tenancy Partitioning**: Users can belong to a `Tenant` (representing specific pizza restaurant franchise stores or managers) with specific permissions.
*   **Auto-Seeding Admin**: Seeds the initial system administrator account at service startup if it doesn't already exist.
*   **Traceable Error Logs**: Winston logs all unhandled and validation errors with a unique UUID trace `ref`, enabling quick lookup in production environments.

---

## 🛠️ Technology Stack

*   **Runtime**: Node.js (v18+ recommended)
*   **Language**: TypeScript (v4.5.2) with strict type-checking
*   **Framework**: Express (v4.18.2)
*   **Database ORM**: TypeORM (v0.3.17)
*   **Database**: PostgreSQL (driver: `pg` v8.4.0)
*   **Signature & Verification**: `jsonwebtoken`, `express-jwt`, `jwks-rsa`, `rsa-pem-to-jwk`
*   **Validation**: `express-validator` (v7.0.1)
*   **Testing**: Jest (v29.6.4), Supertest (v6.3.3), `mock-jwks`

---

## 📂 Directory Structure

```yaml
mernspace-c-auth-service/
├── certs/                      # 🔑 RSA-2048 Public & Private keys
│   ├── private.pem
│   └── public.pem
├── public/                     # 📂 Static assets
│   └── .well-known/
│       └── jwks.json           # 🔓 JSON Web Key Set (public key representation)
├── scripts/                    # 📜 Utility scripts
│   ├── convertPemToJwk.mjs    # Convert public.pem to JWK format
│   ├── generateKeys.mjs       # Generate new RSA Keypairs
│   └── run-migration.js       # Auto-run TypeORM migrations
├── src/                        # 💻 Source Code
│   ├── config/                 # Datasource, Logger, and Env Config
│   ├── constants/              # System Roles constants (admin, manager, customer)
│   ├── controllers/            # Route Controllers (Auth, Tenant, User)
│   ├── entity/                 # TypeORM entities (User, Tenant, RefreshToken)
│   ├── middlewares/            # Auth, RBAC, and global error handlers
│   ├── migration/              # SQL schema migration scripts
│   ├── routes/                 # Express routers for auth, users, tenants
│   ├── services/               # Business logic services
│   ├── validators/             # Schema-based request body/query validators
│   ├── app.ts                  # App instantiation & middleware registry
│   └── server.ts               # Server bootstrapping and DB connections
└── tests/                      # 🧪 Suite of Unit & Integration tests
```

---

## 🚀 Quick Start

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.dev` in the root directory. Here is a baseline configuration:
```env
PORT=5501
NODE_ENV=dev

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=mernstack_auth_service

# Security Secrets
REFRESH_TOKEN_SECRET="your-super-secret-hmac-key"
JWKS_URI=http://localhost:5501/.well-known/jwks.json

# Domain Scoping (Defaults to localhost if left blank)
MAIN_DOMAIN=

# RSA Asymmetric Private Key (Replace with your certs/private.pem contents)
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"

# System Administrator Seeding
ADMIN_EMAIL=admin@yourapp.com
ADMIN_PASSWORD=StrongAdminPassword123!
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
```

### 3. Generate Encryption Keys
If keys do not exist in `./certs/`, generate them and produce the JWK static mapping:
```bash
# Generate certs/private.pem and certs/public.pem
node scripts/generateKeys.mjs

# Export public JWK mapping to static public directory
node scripts/convertPemToJwk.mjs > public/.well-known/jwks.json
```

### 4. Running the Service
```bash
# Run in development mode (with nodemon)
npm run dev

# Compile TypeScript to JavaScript
npm run build

# Start production build
npm run start

# Run comprehensive test suites
npm run test
```

---

## 📚 API Endpoints

### 🔑 Authentication Routes (`/auth`)

#### 📝 Register a Customer
*   **Method**: `POST /auth/register`
*   **Body**:
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (201 Created)**: Sets `accessToken` and `refreshToken` cookies.
    ```json
    { "id": 1 }
    ```

#### 🔓 Login User
*   **Method**: `POST /auth/login`
*   **Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK)**: Sets `accessToken` and `refreshToken` cookies.
    ```json
    { "id": 1 }
    ```

#### 👤 Fetch Current Profile
*   **Method**: `GET /auth/self`
*   **Headers**: `Authorization: Bearer <accessToken>` (Or provided via `accessToken` cookie).
*   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "tenant": null
    }
    ```

#### 🔄 Sliding Token Refresh
*   **Method**: `POST /auth/refresh`
*   **Headers**: Relies on `refreshToken` cookie.
*   **Response (200 OK)**: Deletes old refresh token, registers a new one, sets new cookies, and returns user ID:
    ```json
    { "id": 1 }
    ```

#### 🚪 Logout User
*   **Method**: `POST /auth/logout`
*   **Headers**: Authenticated request.
*   **Response (200 OK)**: Deletes refresh token from DB and clears both client cookies.
    ```json
    {}
    ```

---

### 🏢 Tenant Management (`/tenants`)
*Administrative endpoints to govern franchise/restaurant tenants.*

#### ➕ Create Tenant (Admin Only)
*   **Method**: `POST /tenants`
*   **Body**: `{ "name": "Pizza Palace", "address": "123 Main St" }`
*   **Response (201 Created)**: `{ "id": 1 }`

#### 📋 Fetch All Tenants (Public)
*   **Method**: `GET /tenants?q=searchterm&currentPage=1&perPage=6`
*   **Response (200 OK)**:
    ```json
    {
      "currentPage": 1,
      "perPage": 6,
      "total": 1,
      "data": [
        { "id": 1, "name": "Pizza Palace", "address": "123 Main St", "createdAt": 1698293021, "updatedAt": 1698293021 }
      ]
    }
    ```

---

### 👥 User Governance (`/users`)
*Admin-only routes to create, update, and manage all user credentials & roles.*

#### ➕ Create User (Admin Only)
*   **Method**: `POST /users`
*   **Body**:
    ```json
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@pizza-palace.com",
      "password": "managerPassword123!",
      "role": "manager",
      "tenantId": 1
    }
    ```
*   **Response (201 Created)**: `{ "id": 2 }`

#### 📋 Search & Paginate Users (Admin Only)
*   **Method**: `GET /users?q=keyword&role=manager&currentPage=1&perPage=6`
*   **Response (200 OK)**: Returns paginated user array, matching email/fullname, filtered by role.

#### ❌ Delete User (Admin Only)
*   **Method**: `DELETE /users/:id`
*   **Response (200 OK)**: `{ "id": 2 }`

---

## 📋 Standardized Error Responses

All runtime and validation errors return a consistent, audited envelope managed by the `globalErrorHandler`:

```json
{
  "errors": [
    {
      "ref": "8e02d6b3-6c84-4824-9125-9df8fa69352e",
      "type": "HttpError",
      "message": "Email is already exists!",
      "path": "/auth/register",
      "method": "POST",
      "location": "server",
      "stack": null
    }
  ]
}
```

*   `ref`: A unique UUID that correlates the client error response with a matching log entry in Winston (`logs/app.log`).
*   `stack`: Visible in development, hidden (`null`) automatically in `production` to prevent source code leaks.
