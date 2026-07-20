const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => mongoose.connection.db.collection('products').deleteMany({
    manufacturerId: new mongoose.Types.ObjectId('6a5d89723c8b8ff9e9763252')
  }))
  .then(console.log)
  .then(() => process.exit(0))
  .catch(console.error);
