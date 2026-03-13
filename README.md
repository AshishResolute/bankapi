# 🏦 BankAPI — Secure Banking REST API

A production-grade banking backend API built with Node.js and Express.js, featuring JWT authentication, PostgreSQL transactions, Redis-powered rate limiting, and full Swagger documentation.

**Live Docs:** [https://bankapi-1-5iag.onrender.com/api-docs/](https://bankapi-1-5iag.onrender.com/api-docs/)  

---

## ✨ Features

- 🔐 **JWT Authentication** — Access tokens (15min) + Refresh tokens (1 day) via HTTP-only cookies
- 💳 **Banking Transactions** — Credit/debit with atomic PostgreSQL transactions and rollback on failure
- 🛡️ **Rate Limiting** — Redis-backed distributed rate limiting using `rate-limit-redis` and Upstash
- 📋 **Input Validation** — Request validation using Joi schemas on all routes
- 🧾 **Transaction Logging** — Every transaction (including failed ones) is logged to the database
- 📖 **Swagger Docs** — Interactive API documentation at `/api-docs`
- 🧪 **Unit Tests** — Jest + Supertest test suite covering auth, transactions, and user routes (70% + Test Coverage)

---
### In Development
- **Email Service**: Email notifications for transactions
- **Redis + Bull MQ**: Queue management for async email processing
- Transaction confirmation emails
- Account activity notifications

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (pg) |
| Cache / Rate Limit | Redis (Upstash) |
| Authentication | JWT (jsonwebtoken) |
| Validation | Joi |
| Password Hashing | bcrypt |
| Documentation | Swagger (swagger-jsdoc + swagger-ui-express) |
| Testing | Jest + Supertest |
| Deployment | Render |

---

## 📁 Project Structure

```
├── database/
│   ├── connection.js        # PostgreSQL pool setup
│   ├── redis.js             # Redis client setup (Upstash)
│   └── schema.sql           # Database schema
├── routes/
│   ├── main.js              # App entry, middleware setup
│   ├── auth.js              # Signup, login, refresh token
│   ├── users.js             # Delete account, update password, transaction history
│   └── transactions.js      # Credit and debit routes
├── middlewares/
│   └── verifyToken.js       # JWT verification middleware
├── rate-limiter/
│   └── limiter.js           # Rate limiting config (general + login)
├── config/
│   └── swagger.js           # Swagger/OpenAPI config
├── helperFunctions/
│   ├── AccountNo.js         # Unique account number generator
│   └── transactionId.js     # Transaction ID generator
├── tests/
│   ├── auth.test.js
│   ├── transaction.test.js
│   └── users.test.js
└── server.js                # Server entry point
```

---

## 🗄 Database Schema

```sql
users                  -- Core user info (email, account_no, phone)
userDetails            -- Hashed passwords (separate table)
user_balance           -- Account balance + account type (savings/current)
user_transaction_details -- Full transaction history with status
```

All tables use **foreign key constraints** with `ON DELETE CASCADE`. Enum types enforce valid values for account type, transaction type, and transaction status.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Redis (or Upstash account for cloud Redis)

### Installation

```bash
git clone https://github.com/AshishResolute/bankapi
cd bankapi
npm install
```

### Environment Variables

Create a `dev.env` file in the root:

```env
DB_HOST=your_postgres_host
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name
DB_PORT=5432

JWT_KEY=your_jwt_secret_key

REDIS_URL=rediss://default:password@your-upstash-host:6379

SERVER_DEV_PORT=3000
```

### Database Setup

```bash
psql -U your_user -d your_database -f database/schema.sql
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

### Tests

```bash
npm test
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/signUp` | Register new user | ❌ |
| POST | `/auth/login` | Login, returns JWT | ❌ |
| POST | `/auth/refreshToken` | Refresh access token | ❌ |

### Transactions

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/transactions/credit` | Credit amount to account | ✅ |
| POST | `/transactions/debit` | Debit amount from account | ✅ |

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| DELETE | `/users/deleteUser` | Delete account | ✅ |
| PATCH | `/users/updatePassword` | Update password | ✅ |
| GET | `/users/debitHistory` | Paginated debit history | ✅ |
| GET | `/users/creditTransactions` | Paginated credit history | ✅ |

> Full interactive documentation available at [`/api-docs`](https://bankapi-1-5iag.onrender.com/api-docs/)

---

## 🔒 Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT access tokens expire in **15 minutes**
- Refresh tokens stored in **HTTP-only cookies**
- Rate limiting on all routes — **5 requests per 2 minutes**
- Login endpoint has stricter limiting — **5 attempts per 15 minutes**
- Input validation on every route using **Joi**

---

## ⚡ Rate Limiting

Rate limiting is backed by **Redis (Upstash)** for persistence across server restarts and deployments. Two limiters are configured:

- **General limiter** — 5 requests / 2 min on all protected routes
- **Login limiter** — 5 attempts / 15 min on `/auth/login`

---

## 🧪 Testing

Tests are written with **Jest** and **Supertest**, using mocked DB connections to avoid hitting the real database.

```bash
npm test
```

Coverage includes:
- Auth routes (signup, login)
- Transaction routes (credit, debit, insufficient balance)
- User routes (delete, update password, transaction history)

---

## 📄 License

MIT
