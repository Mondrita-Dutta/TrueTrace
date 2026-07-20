const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await mongoose.connection.db.collection('products').find({}).toArray();
  for (const p of products) {
    const publicPayload = {
      manufacturerName: p.manufacturerCompany || p.manufacturerName,
      brandName: p.brandName,
      productName: p.productName,
      serialNumber: p.serialNumber,
      batchNumber: p.batchNumber,
      manufacturingDate: p.manufacturingDate ? new Date(p.manufacturingDate).toISOString().split('T')[0] : '',
      expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
      timestamp: p.blockchainTimestamp ? new Date(p.blockchainTimestamp).toISOString() : new Date(p.createdAt).toISOString()
    };
    
    const sortedPublic = JSON.stringify(publicPayload, Object.keys(publicPayload).sort());
    const hashPublic = crypto.createHash('sha256').update(sortedPublic).digest('hex');
    
    if (hashPublic !== p.blockchainHash) {
      console.log(`Fixing corrupted hash for ${p.productId}`);
      await mongoose.connection.db.collection('products').updateOne(
        { _id: p._id },
        { $set: { blockchainHash: hashPublic } }
      );
    }
  }
  console.log('All DB Hashes repaired!');
  process.exit(0);
});
