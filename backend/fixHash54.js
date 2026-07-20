const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => mongoose.connection.db.collection('products').updateOne(
    { productId: 'TT-2026-000054' },
    { $set: { blockchainHash: 'a35d580ff94e59c79eccdc58c73146eb758298c119b57416d9be81329620da6a' } }
  ))
  .then(() => {
    console.log('Fixed DB hash for 054');
    process.exit(0);
  });
