const mongoose = require('mongoose');
const dotenv = require('dotenv');
const QRCode = require('qrcode');
const path = require('path');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const products = await Product.find({});
    for (const product of products) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const qrDataString = frontendUrl + '/verify/' + product.productId;
      const qrFilename = `qr-${product.productId}.png`;
      const qrFilePath = path.join(__dirname, 'uploads/qrcodes', qrFilename);
      
      await QRCode.toFile(qrFilePath, qrDataString, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      console.log(`Regenerated QR for ${product.productId}`);
    }
    console.log('Done');
    process.exit(0);
  })
  .catch(console.error);
