const mongoose = require('mongoose');

function connectDB() {
  const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uber-video';
  
  mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = connectDB;