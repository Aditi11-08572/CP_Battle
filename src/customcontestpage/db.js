const mongoose = require('mongoose');

// Replace <your_password> and <your_database_name> with your actual password and database name
const uri = 'mongodb+srv://shreyashdeotale255:<shreyashdilipdeotale12345678>@cluster-1.i3zyj.mongodb.net/<shreyashdeotale255>?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
