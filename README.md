# NestJS Wallet & Payments Service

A production-ready **wallet and payments service** built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma**.
Supports wallet management, Paystack-powered funding, transfers, coupons, and subscription-based payments with webhook verification.

---

##  Tech Stack

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

### Coupon System

* Coupons must exist in the database **before** they can be applied
* Coupons are validated **before payment initialization**
* Coupon usage is incremented **only after successful Paystack webhook**
* Coupon enforcement is **wallet-aware and email-aware**

### Seeding Default Coupons

This project includes a Prisma seed script for initializing coupons.

```bash
npx ts-node prisma/seed/coupons.ts
```

The seed script:

* Inserts predefined coupons (e.g. `FIRSTMONTHFREE`)
* Prevents duplicate coupon codes
* Sets usage limits and activation rules

Example seeded coupon:

```ts
{
  code: 'FIRSTMONTHFREE',
  type: 'PERCENTAGE',
  value: 100,
  maxUsage: 1,
  isActive: true
}
```

> ⚠️ If this script is not run, coupon validation will fail.

---

### Creating Custom Coupons

Coupons can be added in two ways:

#### Option 1: Prisma Studio

```bash
npx prisma studio
```

#### Option 2: Programmatically

```ts
await prisma.coupon.create({
  data: {
    code: 'SUMMER10',
    type: 'PERCENTAGE',
    value: 10,
    maxUsage: 100,
    isActive: true,
  },
});
```

---

### `FIRSTMONTHFREE` Rules

The `FIRSTMONTHFREE` coupon is strictly enforced:

* One-time per **wallet**
* One-time per **email**
* Requires an **activation fee**
* Subscription is created **after webhook confirmation**
* Subscription start date is automatically scheduled for the next billing cycle

This prevents abuse even if:

* A new wallet is created
* The same email is reused
* Requests are replayed

---

## Paystack Webhook Configuration (Required)

Wallet funding and subscription activation **will not work** unless Paystack webhooks are configured.

### Configure Webhook URL in Paystack Dashboard

1. Log in to your **Paystack Dashboard**
2. Navigate to **Settings → API Keys & Webhooks**
3. Set the Webhook URL to:

```text
POST https://your-domain.com/webhook
```

#### Local Testing Example (ngrok)

```text
POST https://abcd-1234.ngrok.io/webhook
```

---

### Webhook Responsibilities

The webhook handler is responsible for:

* Verifying transaction authenticity
* Enforcing idempotency using transaction reference
* Crediting wallet balances
* Persisting transactions
* Incrementing coupon usage
* Activating subscriptions

> ⚠️ Wallet balances are updated **only via webhook**, never from the client response.

---

### Webhook Security

* Paystack signatures are verified using:

```env
PAYSTACK_SECRET_KEY
```

* Invalid signatures are rejected
* Duplicate references are ignored

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

## API Endpoints

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
POST /webhook
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

##  Key Design Decisions

* **No optimistic wallet crediting**
* **Webhook-first accounting**
* **Email-based fraud prevention**
* **Strict idempotency**
* **Separation of concerns**

  * Wallet logic
  * Payment initialization
  * Webhook settlement

---

## Scaling & Production Considerations

* Add Redis for webhook deduplication
* Add background jobs (BullMQ) for retries
* Introduce audit logs
* Add authentication & RBAC
* Implement refunds & chargebacks
* Rate limit payment endpoints

---

##  Important Notes

* Wallet balances reflect **settled funds only**
* Paystack is the source of truth for payments
* Prisma transactions prevent race conditions
* Emails are mandatory for funding & subscriptions

---

##  Status

✅ Database-backed
✅ Payment-safe
✅ Webhook-secure
✅ Coupon-aware
✅ Subscription-ready

---



