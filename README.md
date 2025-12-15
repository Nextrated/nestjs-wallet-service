# NestJS Wallet Service

A simple wallet service built with NestJS and TypeScript.  
Allows creating wallets, funding them, transferring funds, and fetching wallet details with transaction history.  
Uses **in-memory storage**.

---

## Tech Stack

- NestJS
- TypeScript
- In-memory storage (array)
- UUID for wallet/transaction IDs

---

## ⚡ Features

- **Create Wallet** (`POST /wallets`)
- **Fund Wallet** (`POST /wallets/:id/fund`)
- **Transfer Between Wallets** (`POST /wallets/transfer`)
- **Fetch Wallet Details** (`GET /wallets/:id`)
- **List all wallets** (`GET /wallets`)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

**Development mode (hot reload):**

```bash
npm run start:dev
```

**Production mode (single process, persistent in-memory during session):**

```bash
npm run start
```

> ⚠️ In-memory storage will reset on server restart or when code changes trigger hot reload.

---

### 3. API Endpoints

#### Create Wallet

```http
POST /wallets
```

**Response:**

```json
{
  "id": "wallet-uuid",
  "currency": "USD",
  "balance": 0
}
```

---

#### Fund Wallet

```http
POST /wallets/:id/fund
Content-Type: application/json

{
  "amount": 100
}
```

**Response:**

```json
{
  "id": "wallet-uuid",
  "currency": "USD",
  "balance": 100
}
```

---

#### Transfer Between Wallets

```http
POST /wallets/transfer
Content-Type: application/json

{
  "fromWalletId": "wallet-1-id",
  "toWalletId": "wallet-2-id",
  "amount": 50
}
```

**Response:**

```json
{
  "message": "Transfer successful"
}
```

---

#### Fetch Wallet Details

```http
GET /wallets/:id
```

**Response:**

```json
{
  "id": "wallet-uuid",
  "currency": "USD",
  "balance": 50,
  "transactions": [
    {
      "id": "tx-uuid",
      "walletId": "wallet-uuid",
      "type": "FUND",
      "amount": 100,
      "createdAt": "2025-12-15T22:10:00.000Z"
    },
    {
      "id": "tx-uuid",
      "walletId": "wallet-uuid",
      "type": "TRANSFER_OUT",
      "amount": 50,
      "createdAt": "2025-12-15T22:15:00.000Z"
    }
  ]
}
```

---

#### List All Wallets (Debug / Optional)

```http
GET /wallets
```

**Response:**

```json
[
  {
    "id": "wallet-1-id",
    "currency": "USD",
    "balance": 50
  },
  {
    "id": "wallet-2-id",
    "currency": "USD",
    "balance": 150
  }
]
```

---

### 4. Notes / Assumptions

* Wallet IDs are UUIDs generated in memory.
* Transactions are stored in memory.
* Data will reset if the server restarts or code changes (hot reload).
* Only positive amounts allowed for funding or transfers.
* Transfers prevent negative balances.
* No authentication implemented.
* Idempotency not implemented.

---

### 5. Scaling Considerations

* Replace in-memory storage with a database (Postgres, MongoDB, etc.) for production.
* Use transaction logic to prevent race conditions.
* Add authentication & authorization.
* Add idempotency keys for repeated requests.

---

### Postman Collection

A Postman collection is provided for testing all wallet endpoints.

**Steps to use:**
1. Download and open Postman.
2. Import the collection JSON file `Novacrust Wallet.postman_collection.json`.
3. Update the `:id` path variables with wallet IDs returned from **Create Wallets**.
4. Execute the requests in order:
   - Create Wallets
   - Fund Wallet
   - Transfer fund
   - Get Wallet Details
   - Get Wallets




