# TrueTrace Database Schema

## Collections

### 1. Users (Manufacturers)
- `name` (String, required)
- `company` (String, required)
- `email` (String, unique, required)
- `password` (String, required)
- `role` (Enum: ['admin', 'manufacturer'])
- `walletAddress` (String)

### 2. Products
- `productId` (String, unique, required)
- `productName` (String, required)
- `category` (String, required)
- `brandName` (String, required)
- `manufacturerId` (ObjectId, ref: 'User')
- `batchNumber` (String, required)
- `serialNumber` (String, unique, required)
- `manufacturingDate` (Date, required)
- `expiryDate` (Date)
- `productImage` (String - URL)
- `qrImageUrl` (String - URL)
- `blockchainStatus` (Enum: ['Pending', 'Verified', 'Failed'])
- `blockchainTxHash` (String)

### 3. ProductTemplates
- Contains duplicate fields of Products to allow rapid batch registrations without retyping common metadata (brand, category, description, etc.).

## Indexes & Constraints
- `Users`: `email` (Unique Index)
- `Products`: `productId` (Unique Index), `serialNumber` (Unique Index)
- Duplicate key errors (`E11000`) are handled by `errorMiddleware.js`.
