<div align="center">
  
# TrueTrace

**Verify Every Product. Trust Every Purchase. Blockchain-powered supply chain authenticity built on the Stellar network using Soroban Smart Contracts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar](https://img.shields.io/badge/Network-Stellar_Testnet-black)](https://stellar.org/)
[![Soroban](https://img.shields.io/badge/Smart_Contracts-Soroban-orange)](https://soroban.stellar.org/)

  <h3>🚀 Live Production Deployment: <a href="https://truetrace-demo.vercel.app/">https://truetrace-demo.vercel.app/</a></h3>

*"TrueTrace is a Web3 supply chain verification platform that allows manufacturers to register products securely on the Stellar blockchain, providing consumers with an immutable source of truth to verify the authenticity and lifecycle of their purchases."*

</div>

---

## 📖 Project Overview

### The Problem
Counterfeit products remain a pervasive issue across global supply chains. When manufacturers release products, tracking them securely and ensuring end-consumers receive genuine items is extremely difficult. Traditional databases can be tampered with, and basic QR codes can easily be cloned.

### The Solution: TrueTrace
TrueTrace solves this by anchoring product metadata and lifecycle events directly to the Stellar blockchain. 
- **Immutable Registration:** Manufacturers mint their product records as unique, immutable assets on-chain via Soroban smart contracts.
- **Consumer Verification:** Consumers simply scan a QR code to read the item's digital passport, fetching the unalterable truth from the decentralized ledger.
- **Counterfeit Detection:** Through our scan history engine, repeated scans of cloned items or scans from impossible geographic locations flag the item as a potential counterfeit, protecting both brand integrity and consumer safety.

### Why Stellar & Soroban?
- **Stellar Network:** Stellar's low transaction fees (fractions of a cent) and rapid consensus (3-5 seconds) make it the perfect ledger for high-volume supply chain operations.
- **Soroban Smart Contracts:** Soroban provides a secure, predictable Rust-based WebAssembly environment, ensuring that the custody and status rules of every product are enforced immutably on-chain.

---

## 🚀 Features & Tech Stack

**Frontend Layer**
- **Framework:** React with Vite
- **Styling:** Tailwind CSS
- **Integration:** Stellar SDK / Soroban RPC

**Backend Layer**
- **Server:** Node.js & Express.js
- **Database:** MongoDB (via Mongoose) for off-chain analytics and fast queries (e.g., Scan History mapping).
- **Authentication:** JWT Role-Based Access (Admin/Manufacturer).

**Blockchain Layer**
- **Smart Contracts:** Rust (Soroban SDK)
- **Network:** Stellar Testnet

---

## ⚙️ Architecture & Core Mechanism

### High-Level System Architecture

```mermaid
graph TD
    A[Manufacturer Dashboard] -->|Registers Product| B(Node.js / Express Backend)
    B -->|Mints to Blockchain| C(Soroban Smart Contract)
    B -->|Caches Metadata| D[(MongoDB)]
    C -->|Stores Immutable State| E[(Stellar Network)]
    F[Consumer Mobile] -->|Scans QR Code| B
    B -->|Reads Provenance| E
    B -->|Logs Analytics| D
    B -- Returns Verification Result --> F
```

1. **Backend Integration (Express & MongoDB):** The backend serves as the bridge for creating product templates and logging off-chain telemetry like IP addresses, locations, and timestamps (`ScanHistory` model). This allows manufacturers to see deep analytics without bogging down the blockchain with unnecessary data.
2. **Soroban Smart Contracts (Rust):** The heavy lifting of trust is executed on-chain. When a product is registered, the Soroban `truetrace` contract permanently records its existence and status on the Stellar network. 
3. **Frontend Dashboard:** A rich React frontend provides manufacturers with insights, generated QR codes, and total verification counts. Consumers use a lightweight, mobile-responsive view to scan and verify.

---

## 📁 Project Directory Structure

```text
TrueTrace/
├── backend/                    # Express.js Node API & MongoDB Models
│   ├── models/                 # Mongoose schemas (ScanHistory, ProductTemplate)
│   ├── routes/                 # API Endpoints (Admin, Verification)
│   └── server.js               # Main Backend Entrypoint
├── blockchain/                 # Soroban Smart Contracts Workspace
│   ├── contracts/truetrace/    # Core Product Registry Contract in Rust
│   └── Cargo.toml              # Rust Workspace configuration
├── frontend/                   # React Frontend Application (Vite)
│   ├── src/pages/              # Manufacturer Dashboards & Public Views
│   └── package.json            # NPM Dependencies
└── README.md                   # Project Documentation
```

---

## 📸 Platform Previews

### 🌟 Manufacturer Dashboard
*Manufacturers can track all minted products, total authentic scans, and potential counterfeits in one clean dashboard.*
`[INSERT SCREENSHOT: Manufacturer Dashboard showing metrics and product table]`

### 🔍 Consumer QR Verification
*Consumers scan the physical QR code to immediately see the product's on-chain provenance and verification status.*
`[INSERT SCREENSHOT: Mobile Verification View with Success/Counterfeit alert]`

### 📊 Scan History Analytics
*Detailed reports on where and when products are being scanned.*
`[INSERT SCREENSHOT: Scan History location mapping]`

---

## 💻 Local Development & Setup

### Prerequisites
- Node.js (v20+)
- Rust (v1.80+) and `stellar-cli`
- MongoDB instance (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Create a .env file based on environment requirements (MONGO_URI, JWT_SECRET, etc.)
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

---

## 🛡️ CI/CD Pipeline & Deployment

TrueTrace is built with production in mind. 
- **Vercel:** We recommend deploying the React frontend to Vercel. Connect the GitHub repo, set the Framework Preset to Vite, and configure your `.env` variables.
- **Render:** Deploy the Node.js backend to Render as a Web Service. Ensure your `MONGO_URI` and other secrets are safely stored in the environment configuration.
- **GitHub Actions:** The repository includes a robust CI/CD pipeline (`.github/workflows/ci-cd.yml`) that automatically lints, tests, and builds the Rust smart contract (`wasm32-unknown-unknown`) on every push.

---

## 🤝 Contributing
Contributions are welcome! Please ensure that any feature additions are accompanied by relevant tests.
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/new-idea`).
3. Commit your changes (`git commit -m 'feat: added new idea'`).
4. Push to the branch (`git push origin feature/new-idea`).
5. Open a Pull Request.

## License
This project is licensed under the **MIT License**.
