# Architecture — Arduino Ecommerce Website

> Stable checkpoint snapshot — 2026-06-29

---

## Overview

A full-stack ecommerce application for Arduino components, built with a React SPA frontend and a serverless Express backend on AWS.

---

## Frontend

**Runtime & Build**

| Concern | Technology |
|---|---|
| Framework | React 18 (JSX) |
| Bundler | Vite |
| Styling | Tailwind CSS |
| Routing | `react-router-dom` (client-side SPA routing) |

**Pages & Routes**

| Path | Component | Purpose |
|---|---|---|
| `/` | `Home.jsx` | Landing page |
| `/shop` | `Shop.jsx` | Product catalogue |
| `/cart` | `Cart.jsx` | Cart review & checkout prep |
| `/products/:id` | `ProductDetail.jsx` | Individual product detail |

**State Management — Cart**

Cart state is managed via React Context (`CartContext.jsx`) and is **persisted to `localStorage`** so the cart survives page refreshes and browser restarts.

- `addToCart(product, quantity)` — adds an item or increments quantity, clamped to `product.stock`
- `updateQuantity(productPK, newQuantity)` — adjusts quantity, clamped to `[1, item.stock]`
- `removeFromCart(productPK)` — removes a single line item
- `clearCart()` — empties the cart entirely

**Product Catalogue**

`Shop.jsx` fetches `GET /api/products` on mount. Product cards render an **"Out of Stock"** disabled state when `product.stock === 0`. Items are keyed and identified by their DynamoDB `PK` field (`PRODUCT#<uuid>`).

---

## Backend

**Runtime & Framework**

| Concern | Technology |
|---|---|
| Runtime | Node.js 20.x |
| Framework | Express.js |
| Serverless adapter | `serverless-http` (wraps Express for Lambda) |
| Deployment tool | Serverless Framework v4 |

**Active API Routes**

All routes are prefixed `/api` and handled by a single Lambda function via API Gateway HTTP API.

| Method | Path | Handler | Description |
|---|---|---|---|
| `GET` | `/api/health` | inline `server.js` | Health check — returns `{ status: 'ok', timestamp }` |
| `GET` | `/api/products` | `listProducts` | Returns all product records (public, no auth) |
| `POST` | `/api/products` | `createProductHandler` | Creates a new product with a UUID `PK` |
| `PUT` | `/api/products/:id` | `updateProductHandler` | Partial update — any subset of product fields |
| `DELETE` | `/api/products/:id` | `deleteProductHandler` | Hard-deletes a product record |

**Local Development**

When `NODE_ENV !== 'production'`, the server binds to `http://localhost:3000` via `app.listen(3000)`.

**CORS**

The `cors()` middleware is mounted globally. Dynamic origin control (scoped to the Amplify domain) is in-progress on the `dev` branch.

---

## Database

**AWS DynamoDB — Single-Table Design**

| Property | Value |
|---|---|
| Table name pattern | `arduino-ecommerce-backend-{stage}-products` |
| Region | `ap-northeast-1` (Tokyo) |
| Billing | `PAY_PER_REQUEST` (on-demand) |
| AWS SDK | v3 (`@aws-sdk/lib-dynamodb` with `DynamoDBDocumentClient`) |

**Key Schema**

| Key | Type | Role |
|---|---|---|
| `PK` | String (HASH) | Entity identifier, e.g. `PRODUCT#<uuid>` |
| `SK` | String (RANGE) | Record type, e.g. `METADATA` |

**Product Item Shape**

```
PK          — "PRODUCT#<uuid>"
SK          — "METADATA"
name        — string
description — string
category    — string
price       — number
stock       — number
createdAt   — ISO 8601 timestamp
```

---

## Hosting & Infrastructure

| Layer | Service |
|---|---|
| Frontend hosting | AWS Amplify (CI/CD + static CDN) |
| Frontend build root | `frontend/` (`appRoot: frontend`) |
| Frontend artifact | `frontend/dist/` |
| Backend compute | AWS Lambda (Node.js 20.x) |
| Backend API surface | AWS API Gateway — HTTP API (`/{proxy+}`) |
| Infrastructure-as-Code | Serverless Framework v4 (`backend/serverless.yml`) |
| Deployment stages | `dev` (default) · `prod` (via `--stage prod`) |

**Lambda IAM Permissions** (scoped to the products table only)

`GetItem` · `PutItem` · `UpdateItem` · `DeleteItem` · `Query` · `Scan` · `BatchGetItem` · `BatchWriteItem`
