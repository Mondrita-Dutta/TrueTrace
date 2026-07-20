# TrueTrace Architecture

## High-Level Overview
TrueTrace is a modern MERN-stack web application integrated with Web3 (Stellar Blockchain) to provide immutable supply chain tracking and product verification.

## Components

### 1. Frontend (React + Vite)
- **Role**: Provides the user interface for both the public (consumers) and manufacturers.
- **Key Tech**: React 19, Tailwind CSS v4, Framer Motion, Chart.js.
- **Web3 Integration**: Uses `@creit.tech/stellar-wallets-kit` and `@stellar/freighter-api` to connect directly to the Stellar network for potential manufacturer-side transaction signing.

### 2. Backend (Node.js + Express)
- **Role**: Exposes REST APIs, handles business logic, and communicates with MongoDB and the Stellar network.
- **Key Tech**: Express 5, Mongoose, JWT, bcrypt.
- **Middlewares**: custom error handler, logger, express-validator for robust security.
- **QR Engine**: Generates physical QR codes on the server mapped to a specific product instance.

### 3. Database (MongoDB)
- **Role**: Primary off-chain data store for heavy product metadata, user profiles, and image URLs.
- **Optimization**: Uses unique indexes on `productId` and `serialNumber` to ensure data integrity.

### 4. Blockchain (Stellar)
- **Role**: The decentralized ledger that anchors product state.
- **Mechanism**: The backend hashes critical product metadata and pushes this hash as a `memo` in a Stellar transaction. The resulting transaction hash is saved to MongoDB. The frontend/verification API can independently hash the product data and compare it to the immutable Stellar memo to prove authenticity.
