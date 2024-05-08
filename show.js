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

// Retrieve project name from command-line argument
const project = process.argv[2];

if (!project) {
  console.error('Please provide the project name as an argument.');
  mongoose.disconnect();
  process.exit(1);
}

// Find all files in the specified project
Doc.find({ directory: project })
  .then(files => {
    if (files.length === 0) {
      console.log(`No files found in project "${project}".`);
    } else {
      console.log(`Files in project "${project}":`);
      files.forEach(file => console.log(file.filename));
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error finding files:', err);
    mongoose.disconnect();
    process.exit(1);
  });
