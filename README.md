# 🔐 Authentication API
**A production-ready REST API for user authentication built with Node.js, Express.js and MongoDB.**
JWT authentication · Email OTP verification · Password reset · Rate limiting
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org) [![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com) [![MongoDB](https://img.shields.io/badge/MongoDB-9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com) [![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

---

## 📖 Overview

A clean, secure and well-structured authentication backend implementing the full lifecycle of a user account:

- **Register** → hashed password + welcome email + JWT cookie
- **Login** → JWT stored in `httpOnly` cookie
- **Verify email** → 6-digit OTP, 2-minute TTL
- **Reset password** → OTP via email, invalidates all existing sessions
- **Protected routes** → JWT middleware with token invalidation check

The project focuses on **security best practices** and **clean architecture** — separated controllers, routes, models and middleware — as a reference implementation of a Node.js REST API.

---

## ✨ Features

### Core
- 🔑 **JWT authentication** — stored in `httpOnly` cookies (immune to XSS token theft)
- 🔒 **bcrypt password hashing** — 10 salt rounds
- 📧 **Email OTP verification** — 6-digit code, 2-minute TTL
- 🔁 **Password reset via email** — with session invalidation after reset
- 👤 **User profile endpoint** — protected by JWT middleware

### Security
- 🛡️ **Rate limiting** — global + auth-specific limiters
- ⚡ **Helmet** — HTTP security headers
- 🌐 **CORS** — credentials-aware with allow-listed origins
- 🚫 **User enumeration protection** — generic error messages + constant-time login
- 🔐 **Token invalidation** — `passwordChangedAt` invalidates pre-reset tokens
- ✅ **Input validation** — email format, password policy, 72-byte bcrypt limit
- 🧱 **Centralized error handling** — with proper HTTP status codes
- 🧪 **Env validation on startup** — fail-fast if misconfigured

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | **Node.js** (≥ 20) |
| Framework | **Express.js** 5 |
| Database | **MongoDB** + **Mongoose** 9 |
| Authentication | **JWT** (jsonwebtoken) |
| Hashing | **bcryptjs** |
| Email | **Nodemailer** (Mailtrap / any SMTP) |
| Security | `helmet`, `express-rate-limit`, `cookie-parser` |
| Config | `dotenv` |

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|--------|----------|:----:|------|-------------|
| `POST` | `/register` | ❌ | `{ name, email, password }` | Register a new user |
| `POST` | `/login` | ❌ | `{ email, password }` | Login, set JWT cookie |
| `POST` | `/logout` | ❌ | — | Clear auth cookie |
| `POST` | `/send-verify-otp` | ✅ | — | Send verification OTP to user's email |
| `POST` | `/verify-account` | ✅ | `{ otp }` | Verify account with OTP |
| `GET`  | `/is-auth` | ✅ | — | Check if user is authenticated |
| `POST` | `/send-reset-otp` | ❌ | `{ email }` | Send password reset OTP to email |
| `POST` | `/reset-password` | ❌ | `{ email, otp, newPassword }` | Reset password |

### User — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET`  | `/data` | ✅ | Get authenticated user's data |

### Response format

```json
// ✅ Success
{
  "success": true,
  "message": "Account created successfully"
}

// ❌ Error
{
  "success": false,
  "message": "Invalid credentials"
}
```

**HTTP status codes used:** `200`, `201`, `400`, `401`, `404`, `409`, `429`, `500`, `502`.

---
## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- SMTP credentials — free via [Mailtrap](https://mailtrap.io) sandbox for development

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/authentication-api.git
cd authentication-api
npm install
```

### 2. Configure environment

 `.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your_super_secret_key_here
ALLOWED_ORIGINS=http://localhost:5173

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SENDER_EMAIL=no-reply@example.com
```

### 3. Run

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

The API is available at **`http://localhost:4000`**.

---
## 🧪 Quick Test

### Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

### Get current user

```bash
curl http://localhost:4000/api/user/data -b cookies.txt
```

### Full flow (register → verify email → login → logout)

```bash
# 1. Register (sets cookie)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}' \
  -c cookies.txt

# 2. Send verification OTP (check Mailtrap inbox)
curl -X POST http://localhost:4000/api/auth/send-verify-otp -b cookies.txt

# 3. Verify account
curl -X POST http://localhost:4000/api/auth/verify-account \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456"}' \
  -b cookies.txt

# 4. Logout
curl -X POST http://localhost:4000/api/auth/logout -b cookies.txt
```

---

## 🔐 Security Notes

| Threat | Mitigation |
|--------|-----------|
| XSS on token | JWT stored in `httpOnly` cookie (not accessible to JavaScript) |
| CSRF | `SameSite=strict` in dev · `SameSite=None + Secure` in prod |
| Password storage | bcrypt (10 rounds), never plaintext |
| Brute-force login | Rate limiting on `/api/auth/*` |
| OTP brute-force | 6-digit codes with short TTL + rate limiting |
| User enumeration | Identical messages + constant-time login |
| Reset token hijack | Tokens issued before `passwordChangedAt` are rejected |
| Oversized payloads | `express.json({ limit: '1mb' })` |
| Known header attacks | `helmet` middleware |
| Missing env vars | Fail-fast on startup (`config/env.js`) |

> ⚠️ **Before deploying to production**, ensure:
> - `NODE_ENV=production`
> - `JWT_SECRET` is a strong 32+ character random string
> - `ALLOWED_ORIGINS` contains your frontend's real domain
> - The server runs behind a reverse proxy with `trust proxy` enabled (already configured)

---

## 🧭 Design Decisions

A few noteworthy choices and the reasoning behind them:

- **`httpOnly` cookies over `localStorage`** — prevents token theft via XSS.
- **Response envelope `{ success, message }`** — consistent parsing on the client, easy to extend.
- **`passwordChangedAt` field** — makes "logout everywhere" instant on password reset without a session store.
- **Constant-time login** — dummy bcrypt comparison for missing users, preventing timing-based enumeration.
- **Rate limiting at two layers** — global (DDoS) + auth (brute-force), rather than per-endpoint, for simplicity and clarity.
- **Fail-fast env validation** — avoids silent misconfiguration in production.

