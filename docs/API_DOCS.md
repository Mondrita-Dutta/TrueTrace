# TrueTrace API Documentation

## Standard Response Format
All endpoints return a uniform response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Errors return:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... } // Optional validation errors
}
```

## Public Endpoints

### `GET /api/public/verify/:productId`
Verifies product authenticity against the blockchain.
- **Access**: Public
- **Returns**: Product metadata and boolean `isAuthentic`.

## Manufacturer Endpoints (Requires JWT)

### `POST /api/products`
Registers a new product.
- **Body**: `productName`, `category`, `serialNumber`, `batchNumber`, etc. (Supports `multipart/form-data` for image).
- **Behavior**: Validates data, mints QR code, publishes to Stellar, saves to MongoDB.

### `GET /api/products`
Lists products with pagination.
- **Query Params**: `page`, `limit`, `search`, `category`, `status`.

### `PUT /api/products/:id`
Updates product metadata. Validates that the new serial number doesn't clash.

### `DELETE /api/products/:id`
Deletes a product (supports bulk via comma-separated IDs).

### `POST /api/products/batch`
Creates multiple products for a specific batch number dynamically generating incremental serial numbers.
