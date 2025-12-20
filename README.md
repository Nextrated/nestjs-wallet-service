# NestJS Wallet & Payments Service

A production-ready **wallet and payments service** built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma**.
Supports wallet management, Paystack-powered funding, transfers, coupons, and subscription-based payments with webhook verification.

---

## 🧱 Tech Stack

* **NestJS**
* **TypeScript**
* **PostgreSQL**
* **Prisma ORM**
* **Paystack API** (Payments & Subscriptions)
* REST API Architecture

---

## ⚡ Core Features

### Wallets

* Create wallets
* Fetch wallet balance and transaction history
* Transfer funds between wallets (atomic transactions)

### Payments (Paystack)

* Initialize wallet funding via Paystack
* Secure webhook-based confirmation
* Idempotent transaction processing
* Email-based customer tracking

### Transactions

* FUND
* TRANSFER_IN / TRANSFER_OUT
* ONE_TIME payments
* SUBSCRIPTION_FIRST_CHARGE

### Coupons & Subscriptions

* Coupon validation and usage tracking
* `FIRSTMONTHFREE` coupon (one-time per email + wallet)
* Subscription activation after first successful charge
* Activation fee enforcement
* Email-based abuse prevention

---

## 📦 Database Models (Simplified)

* **Wallet**
* **Transaction**
* **Coupon**
* **Plan (Paystack-backed)**

All financial writes are **ACID-safe using Prisma transactions**.

---

## 🚀 Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

---

### 2️⃣ Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wallet_db"

PAYSTACK_SECRET_KEY=sk_test_xxx
```

---

### 3️⃣ Setup Database

```bash
npx prisma generate
npx prisma migrate dev
```

---

### 4️⃣ Start the Server

**Development (hot reload):**

```bash
npm run start:dev
```

**Production:**

```bash
npm run start
```

---

## 🔌 API Endpoints

---

### Create Wallet

```http
POST /wallets
```

**Response**

```json
{
  "id": "wallet-uuid",
  "currency": "USD",
  "balance": 0
}
```

---

### Fund Wallet (Paystack)

```http
POST /wallets/:id/fund
Content-Type: application/json

{
  "email": "user@email.com",
  "amount": 100
}
```

**Response**

```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "paystack_ref",
  "amount": 100
}
```

> ⚠️ Wallet balance is **NOT updated immediately**.
> Balance is credited **only after Paystack webhook confirmation**.

---

### Paystack Webhook (Internal)

```http
POST /webhook/paystack
```

Handles:

* Charge success events
* Wallet crediting
* Transaction persistence
* Coupon usage tracking
* Subscription activation

> Webhook processing is **idempotent** using transaction reference.

---

### Transfer Between Wallets

```http
POST /wallets/transfer
Content-Type: application/json

{
  "fromWalletId": "wallet-1-id",
  "toWalletId": "wallet-2-id",
  "amount": 50
}
```

**Response**

```json
{
  "message": "Transfer successful"
}
```

* Prevents self-transfer
* Prevents overdraft
* Executes atomically

---

### Fetch Wallet Details

```http
GET /wallets/:id
```

**Response**

```json
{
  "id": "wallet-uuid",
  "currency": "USD",
  "balance": 50,
  "transactions": [
    {
      "id": "tx-uuid",
      "type": "FUND",
      "amount": 100,
      "email": "user@email.com",
      "createdAt": "2025-12-15T22:10:00.000Z"
    },
    {
      "id": "tx-uuid",
      "type": "TRANSFER_OUT",
      "amount": 50,
      "createdAt": "2025-12-15T22:15:00.000Z"
    }
  ]
}
```

---

### List All Wallets (Admin / Debug)

```http
GET /wallets
```

---

## 🎟️ Coupons & Subscriptions

* Coupons validated before payment initialization
* Coupon usage incremented **only after successful webhook**
* `FIRSTMONTHFREE` rules:

  * One-time per **wallet**
  * One-time per **email**
  * Requires activation fee
  * Automatically schedules subscription start date

---

## 🔒 Key Design Decisions

* **No optimistic wallet crediting**
* **Webhook-first accounting**
* **Email-based fraud prevention**
* **Strict idempotency**
* **Separation of concerns**

  * Wallet logic
  * Payment initialization
  * Webhook settlement

---

## 📈 Scaling & Production Considerations

* Add Redis for webhook deduplication
* Add background jobs (BullMQ) for retries
* Introduce audit logs
* Add authentication & RBAC
* Implement refunds & chargebacks
* Rate limit payment endpoints

---

## 🧠 Important Notes

* Wallet balances reflect **settled funds only**
* Paystack is the source of truth for payments
* Prisma transactions prevent race conditions
* Emails are mandatory for funding & subscriptions

---

## 🏁 Status

✅ Database-backed
✅ Payment-safe
✅ Webhook-secure
✅ Coupon-aware
✅ Subscription-ready

---


