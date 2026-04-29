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

## 📦 API Endpoints

- **Auth**: `/api/auth` (Register, Login, Me, Password Reset)
- **Products**: `/api/products` (Search, Get by ID)
- **Categories**: `/api/categories`
- **Orders**: `/api/orders` (Create, History, Track)
- **Cart**: `/api/cart`
- **Store Settings**: `/api/store-settings` (Branding, Config)

---

## 📄 License
This project is licensed under the ISC License.