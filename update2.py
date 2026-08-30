
import os
import re

file_path = 'backend/controllers/productController.js'
with open(file_path, 'r') as f:
    content = f.read()

# Replace in createProductBatch
old_batch = '''      const qrDataPayload = {
        productId,
        manufacturerId: req.user.id,
        timestamp: itemTimestamp,
      };
      const qrDataString = JSON.stringify(qrDataPayload);'''

new_batch = '''      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const qrDataString = frontendUrl + '/verify/' + productId;'''

content = content.replace(old_batch, new_batch)

# Replace in bulkCreateProducts
old_bulk = '''      const qrDataPayload = {
        productId,
        manufacturerId: req.user.id,
        timestamp: new Date().toISOString(),
      };
      const qrDataString = JSON.stringify(qrDataPayload);'''

content = content.replace(old_bulk, new_batch)

with open(file_path, 'w') as f:
    f.write(content)


