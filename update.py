
import os

with open('backend/controllers/productController.js', 'r') as f:
    content = f.read()

old_str = '''    const qrDataPayload = {
      productId,
      manufacturerId: req.user.id,
      timestamp: new Date().toISOString(),
      // The verification URL can be handled on the frontend based on ID, 
      // but we embed the core data here.
    };
    const qrDataString = JSON.stringify(qrDataPayload);'''

new_str = '''    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrDataString = frontendUrl + '/verify/' + productId;'''

content = content.replace(old_str, new_str)
with open('backend/controllers/productController.js', 'w') as f:
    f.write(content)

with open('backend/regenQRs.js', 'r') as f:
    content2 = f.read()

old_str2 = '''      const qrDataPayload = { productId: product.productId };
      const qrDataString = JSON.stringify(qrDataPayload);'''

new_str2 = '''      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const qrDataString = frontendUrl + '/verify/' + product.productId;'''

content2 = content2.replace(old_str2, new_str2)
with open('backend/regenQRs.js', 'w') as f:
    f.write(content2)

