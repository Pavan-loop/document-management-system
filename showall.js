// show.js

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/document-management-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define Schema
const docSchema = new mongoose.Schema({
  directory: String,
  filename: String,
  data: Buffer,
  mimetype: String
});

const Doc = mongoose.model('Doc', docSchema);

// Find all unique directories
Doc.distinct('directory')
  .then(directories => {
    console.log('Directories:');
    directories.forEach(dir => console.log(dir));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error finding directories:', err);
    mongoose.disconnect();
    process.exit(1);
  });
