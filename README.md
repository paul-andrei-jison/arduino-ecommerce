# ⚡ Arduino E-Commerce Surface Module

> A production-grade, serverless full-stack storefront for Arduino components — built on AWS Lambda, API Gateway, DynamoDB, and React 18, with zero managed servers.

---

## 🎯 Project Genesis & The Mindset Shift

For most of my early full-stack career, I built by feel. I would open a blank project, ask an AI assistant for a starting template, and layer feature after feature on top of boilerplate I never fully interrogated. Routes appeared because the AI suggested them. Database schemas materialized because a tutorial said so. The application worked — until it didn't. When bugs surfaced in production, I found myself staring at abstractions I couldn't dismantle because I had never truly built them. I understood the application at the surface level: the components rendered, the endpoints responded, the data arrived. But I could not reason fluently about *why* a particular DynamoDB scan pattern caused latency at scale, or *why* a client-side routing mismatch broke direct URL access on Amplify. I was a passenger in my own codebase, and AI had become my autopilot rather than my power tool.

This project marks a deliberate and permanent change in how I engineer software. Before a single line of code was written, I mapped the full system: the IAM trust boundary between Lambda and DynamoDB, the `serverless-http` adapter layer that translates API Gateway proxy events into Express request objects, the lifecycle of cart state from `localStorage` through React Context to the UI. Every chunk of this project was designed first and delegated to Claude Code second. When the AI generated a solution, I reviewed it structurally — not just for correctness, but for whether it held up against the architecture I had already committed to. This is the philosophy I now hold as non-negotiable: AI will inevitably write the syntax of the future. The modern engineer's irreplaceable contribution is the *macro perspective* — understanding system design, data lifecycle, security boundaries, and infrastructure contracts at a level no prompt can replace. Code review is no longer optional; it is the craft.

---

## 📡 Full-Stack Serverless Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│   Browser  ──►  React 18 SPA (Vite + Tailwind CSS)                  │
│                 ├── react-router-dom  (client-side routing)         │
│                 ├── CartContext.jsx   (state + localStorage)        │
│                 └── Pages: Home · Shop · ProductDetail · Cart       │
│                            AdminDashboard · NotFound (404)          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTPS fetch()
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CDN / HOSTING LAYER                           │
│                                                                     │
│   AWS Amplify  (CI/CD pipeline + CloudFront static asset delivery)  │
│   Build root : frontend/          Artifact : frontend/dist/         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  API requests  →  /api/*
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                              │
│                                                                     │
│   AWS API Gateway — HTTP API                                        │
│   Catch-all routes:  /  and  /{proxy+}  (ANY method)                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  Proxy event (AWS_PROXY integration)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       COMPUTE LAYER                                 │
│                                                                     │
│   AWS Lambda  (Node.js 20.x runtime)                                │
│   ├── serverless-http  →  bridges Lambda event to Express           │
│   ├── Express.js app   →  routes, middleware, CORS                  │
│   └── Active API surface:                                           │
│       GET    /api/health           Health check                     │
│       GET    /api/products         List all products                │
│       POST   /api/products         Create product  (Admin)          │
│       PUT    /api/products/:id     Update product  (Admin)          │
│       DELETE /api/products/:id     Delete product  (Admin)          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  AWS SDK v3  (DynamoDBDocumentClient)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                │
│                                                                     │
│   AWS DynamoDB  —  Single-Table Design  (ap-northeast-1 · Tokyo)    │
│   Table  :  arduino-ecommerce-backend-{stage}-products              │
│   Billing :  PAY_PER_REQUEST  (on-demand, zero idle cost)           │
│                                                                     │
│   Key Schema:                                                       │
│     PK  (HASH)   →  "PRODUCT#<uuid>"                                │
│     SK  (RANGE)  →  "METADATA"                                      │
│                                                                     │
│   Item shape:  name · description · category · price                │
│                stock · createdAt                                    │
└─────────────────────────────────────────────────────────────────────┘

```

---

## 🛠 Tech Stack

**Frontend** — React 18 · Vite · Tailwind CSS · react-router-dom

**Backend** — Node.js 20.x · Express.js · serverless-http · Serverless Framework v4

**AWS** — Lambda · API Gateway (HTTP API) · DynamoDB · Amplify (CI/CD + CDN)

---

<!-- SCREENSHOTS_START -->
<!--
  ╔══════════════════════════════════════════════════════════════════╗
  ║  SCREENSHOT GRID — insert once UI styling is polished           ║
  ║                                                                  ║
  ║  Suggested layout:                                               ║
  ║    ## 📸 Application Screenshots                                ║
  ║                                                                  ║
  ║    | Home Page | Shop Catalogue |                                ║
  ║    |-----------|----------------|                                ║
  ║    | ![Home](docs/screenshots/home.png) | ![Shop](docs/screenshots/shop.png) |
  ║                                                                  ║
  ║    | Product Detail | Cart |                                     ║
  ║    |----------------|------|                                     ║
  ║    | ![Detail](docs/screenshots/product-detail.png) | ![Cart](docs/screenshots/cart.png) |
  ║                                                                  ║
  ║    | Admin Dashboard |                                           ║
  ║    |-----------------|                                           ║
  ║    | ![Admin](docs/screenshots/admin.png) |                      ║
  ╚══════════════════════════════════════════════════════════════════╝
-->
<!-- SCREENSHOTS_END -->

---

## 🚀 Local Development

**Prerequisites:** Node.js 20+, AWS CLI configured, Serverless Framework v4 installed globally.

```bash
# 1. Start the backend locally (Express on port 3000)
cd backend
npm install
node server.js

# 2. Start the frontend dev server (Vite on port 5173)
cd frontend
npm install
npm run dev
```

Environment variables required in `backend/.env` for local runs:

```
PRODUCTS_TABLE=arduino-ecommerce-backend-dev-products
STAGE=dev
```

---

## ☁️ Deployment

```bash
# Deploy backend to AWS (dev stage)
cd backend
npx serverless deploy

# Deploy backend to production
npx serverless deploy --stage prod

# Frontend deploys automatically via AWS Amplify
# on every push to the connected branch (CI/CD pipeline)
```

---

## 📂 Repository Structure

```
.
├── frontend/                  React 18 SPA (Vite + Tailwind)
│   └── src/
│       ├── pages/             Home · Shop · ProductDetail · Cart · AdminDashboard · NotFound
│       ├── components/        Navbar
│       ├── context/           CartContext.jsx  (global cart state)
│       └── App.jsx            Route declarations
│
├── backend/                   Serverless Express API
│   ├── server.js              Entry point — Express app + Lambda handler export
│   ├── src/routes/            productRoutes.js
│   ├── src/handlers/          CRUD handler functions
│   └── serverless.yml         Infrastructure-as-Code (Lambda · API GW · DynamoDB)
│
└── ARCHITECTURE.md            Living architecture reference (route-verified)
```

---

## 💡 Closing Thoughts

The critical paradigm shift of this project wasn't avoiding artificial intelligence — it was positioning the human developer as the Chief Architect. In an industry where syntax generation is becoming highly automated, engineering excellence is measured by a developer's ability to orchestrate, debug, and defend cloud infrastructure boundaries.

---

*Thank you for viewing this project.*
*— Paul Jison*
