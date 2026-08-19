# OneShop Ecommerce Web Application

OneShop is a modern, full-stack ecommerce platform designed for a seamless shopping experience. It features a responsive frontend built with Next.js and a robust backend powered by Node.js, Express, and MongoDB.

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: [Axios](https://axios-http.com/) & [TanStack Query](https://tanstack.com/query/latest)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas/database) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Validation**: [Zod](https://zod.dev/)

---

## ✨ Features

- **User Authentication**: Secure register, login, and password reset functionality.
- **Product Management**: Dynamic product listing, search, and category filtering.
- **Shopping Cart**: Persistent cart management (synced with DB for logged-in users).
- **Wishlist**: Save favorite items for later.
- **Checkout Flow**: Multi-step checkout with shipping address management and delivery zone calculation.
- **Payment Integration**: Support for PayHere (LKR) payments.
- **Dynamic Branding**: Store name, logo, and theme colors are managed via the database.
- **Order Tracking**: Track order status using a unique tracking number.

---

## 🛠️ Project Structure

```text
/ecommerce_web_app
├── /frontend          # Next.js Application
│   ├── /src/app       # Pages and Layouts
│   ├── /src/components # Reusable UI Components
│   ├── /src/context   # Global State (Cart, Store)
│   └── /src/lib       # API Utilities
└── /backend           # Express API
    ├── /src/controllers # Business Logic
    ├── /src/models      # Database Schemas
    ├── /src/routes      # API Endpoints
    └── /src/server.ts   # Entry Point
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/dinukab/ecommerce_web_app.git
cd ecommerce_web_app
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
```
Run the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Run the frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🏢 Multi-Tenancy

The storefront is multi-tenant: one deployment serves many stores, and every
tenant's data lives in its **own database on a single MongoDB server** — the
same cluster and the same provisioning model used by OneShop POS, so the POS
and the storefront read and write the same tenant database.

### How a request finds its tenant

`tenantMiddleware` runs before every `/api` route and resolves the tenant in
this order:

| # | Source | Example | Notes |
|---|--------|---------|-------|
| 1 | Host subdomain | `keels.allinoneshop.store` → `oneshop_keels` | Looked up in the tenant-factory registry; unknown or inactive stores get a 404 |
| 1b | `X-Forwarded-Host` | same as above | Used in place of `Host` when `TRUST_PROXY_HOST=true` — required behind CloudFront / Lambda Function URLs, which rewrite `Host` |
| 2 | `OneShop-Tenant-ID` header | `oneshop_alpha_store` | Only honoured when `ALLOW_TENANT_HEADER=true` |
| 3 | `DEFAULT_TENANT_DB` | `oneshop_open_door` | Fallback for localhost, apex domains, and single-tenant deploys |

The resolved connection is attached to the request, and controllers reach the
database **only** through `req.models`. Importing a model module directly binds
it to the default connection and reads the wrong tenant — the model modules
still export compiled models for the seed scripts, so this is easy to do by
accident.

Because tenants are selected by `Host`, the API must be served on the same
hostname as the storefront in production (proxy `/api` through to it). The
frontend defaults to a same-origin `/api` for exactly this reason;
`NEXT_PUBLIC_API_URL` is only for local development against a separate port.


### Hostname scheme

The tenant is always the **first label**, which is what lets one wildcard
certificate cover every tenant and keeps provisioning zero-touch.

| Surface | Hostname | Certificate |
|---|---|---|
| Storefront | `keels.allinoneshop.store` | `*.allinoneshop.store` |
| POS | `keels.pos.allinoneshop.store` | `*.pos.allinoneshop.store` |
| Tenant Factory | `admin.allinoneshop.store` | `*.allinoneshop.store` |

Note the ordering: `keels.pos.…` and **not** `pos.keels.…`. TLS wildcards match
exactly one label, so `*.allinoneshop.store` would not cover `pos.keels.…` and
every new tenant would need its own certificate before it could serve traffic.
Putting the tenant first means `*.pos.allinoneshop.store` covers all tenants at
once, and `subdomainFromHost` reads the tenant identically for both surfaces.

### Session isolation

Tokens carry a `tenant` claim naming the database that issued them, and
`protect` rejects a token presented to a different store. Without this, one
`JWT_SECRET` shared across all tenants would let a session from one storefront
be replayed against another.

### Adding a tenant

Tenants are provisioned by `oneshop-tenant-factory`, which creates the database,
seeds `storesettings`, and registers it in the `tenants` collection. The
storefront picks it up on the next cache expiry (`TENANT_CACHE_TTL_MS`) — no
storefront deploy is needed.

### Local development

```bash
# Serve a single tenant
DEFAULT_TENANT_DB=oneshop_open_door npm run dev

# Or exercise subdomain routing against a local hosts entry
# 127.0.0.1  alphastore.oneshop.test
```

---

## 📦 API Endpoints

- **Auth**: `/api/auth` (Register, Login, Me, Password Reset)
- **Products**: `/api/products` (Search, Get by ID)
- **Categories**: `/api/categories`
- **Orders**: `/api/orders` (Create, History, Track)
- **Cart**: `/api/cart`
- **Store Settings**: `/api/store-settings` (Branding, Config)

---

