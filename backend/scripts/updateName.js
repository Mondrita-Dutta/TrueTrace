const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => mongoose.connection.db.collection('users').updateOne(
    { email: 'mondritadebayan123@gmail.com' },
    { $set: { firstName: 'Mondrita', lastName: 'Dutta' } }
  ))
  .then(console.log)
  .then(() => process.exit(0))
  .catch(console.error);
