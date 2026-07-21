# TrueTrace
"Verify Every Product. Trust Every Purchase."

TrueTrace is a blockchain-powered supply chain verification platform. It allows manufacturers to register products on the Stellar blockchain and provides a frontend interface for consumers to verify the authenticity and lifecycle of their purchases.

## 🏗️ Architecture

TrueTrace is composed of three main layers:
1. **Frontend**: A React application built with Vite, styled with TailwindCSS.
2. **Backend**: An Express.js Node API connected to MongoDB for off-chain data (users, analytics, QR code management).
3. **Blockchain (Smart Contract)**: A Rust-based Soroban smart contract deployed on the Stellar network to handle immutable product verification.

## 🚀 Deployment Guide (Vercel & Render)

To take TrueTrace from local development to production, we recommend deploying the **Frontend to Vercel** and the **Backend to Render**.

### 1. Deploying the Frontend (Vercel)
Vercel is the optimal hosting platform for Vite/React frontends.
1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Import this GitHub repository.
3. In the project configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add the variables from your `frontend/.env` file. Be sure to update `VITE_API_URL` to point to your live backend URL (once deployed).
5. Click **Deploy**.

### 2. Deploying the Backend (Render)
Render is perfect for Node.js/Express applications.
1. Log in to [Render](https://render.com/) and click **New > Web Service**.
2. Connect your GitHub and select this repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Expand **Environment Variables** and securely add all the variables from your `backend/.env` file (e.g., `MONGO_URI`, `JWT_SECRET`, etc.).
5. Click **Deploy Web Service**.

---

## 💻 Local Development Setup

If you want to run TrueTrace locally, follow these steps:

### Prerequisites
- Node.js (v20+)
- Rust (v1.80+) and `stellar-cli` for smart contract development
- MongoDB instance (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Create a .env file based on environment requirements
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Create a .env file with VITE_API_URL=http://localhost:3000
npm run dev
```

### Smart Contract Deployment (Stellar Testnet)
```bash
cd blockchain
stellar contract build
# Follow the deployment scripts in deploy_contract.sh to push to testnet
```

## 🛡️ CI/CD Pipeline
This repository includes a robust GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) that automatically:
- Lints and tests the frontend and backend.
- Builds the Rust smart contract targeting `wasm32-unknown-unknown` and optimizes it using `stellar-cli`.
- Deploys the codebase (configured via placeholders).
