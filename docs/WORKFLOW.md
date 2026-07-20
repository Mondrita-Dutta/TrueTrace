# TrueTrace End-to-End Workflow

## 1. Manufacturer Registration & Authentication
1. Manufacturer accesses the TrueTrace platform and registers an account.
2. The Node.js backend hashes the password with `bcrypt` and stores the profile in MongoDB.
3. Upon login, a JWT token is generated and stored client-side for authenticated API requests.

## 2. Product Registration & Onboarding
1. The authenticated Manufacturer navigates to the Dashboard -> Register Product.
2. Submits product metadata (name, batch, serial, dates, image).
3. The API validates the data. It rejects duplicates (e.g., duplicate Serial Numbers).
4. The Backend generates a globally unique `productId`.

## 3. QR Code & Blockchain Linkage
1. A JSON payload with core product metadata is generated on the server.
2. The payload is rendered into a high-density PNG QR code using `qrcode`.
3. The server takes the product metadata and hashes it. This hash is submitted to the **Stellar Blockchain** via `stellarService.js`.
4. The resulting `blockchainTxHash` and the `qrImageUrl` are saved to the MongoDB `Product` record.
5. The Manufacturer is given access to download/print the physical QR code to affix to the product.

## 4. Consumer Verification
1. A consumer scans the QR code on a physical product using their smartphone.
2. They are redirected to the TrueTrace public Verification Portal.
3. The frontend sends a request to `GET /api/public/verify/:productId`.
4. The Backend retrieves the product from MongoDB, re-hashes the data, fetches the `memo` from the Stellar Horizon API using the stored `blockchainTxHash`, and compares the local hash to the blockchain hash.
5. The UI displays mathematical proof of authenticity, alongside product details.
