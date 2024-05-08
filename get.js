// get.js

const mongoose = require('mongoose');
const fs = require('fs').promises;

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

// Retrieve project name and filename from command-line arguments
const project = process.argv[2];
const filename = process.argv[3];

if (!project || !filename) {
  console.error('Please provide both the project name and filename as arguments.');
  process.exit(1);
}

// Retrieve the file from MongoDB
Doc.findOne({ directory: project, filename: filename })
  .then(doc => {
    if (!doc) {
      console.error('File not found:', filename);
      mongoose.disconnect();
      process.exit(1);
    }

    // Create "retrieved" folder if it doesn't exist
    const folder = './retrieved';
    return fs.mkdir(folder, { recursive: true })
      .then(() => {
        // Write the file data to the "retrieved" folder
        return fs.writeFile(`${folder}/${filename}`, doc.data);
      })
      .then(() => {
        console.log(`File "${filename}" retrieved and stored in "retrieved" folder.`);
        mongoose.disconnect();
      });
  })
  .catch(err => {
    console.error('Error retrieving file:', err);
    mongoose.disconnect();
    process.exit(1);
  });
