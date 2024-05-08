// upload.js

const mongoose = require('mongoose');
const fs = require('fs');

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

// Check if the file exists
if (!fs.existsSync(filename)) {
  console.error('File not found:', filename);
  process.exit(1);
}

// Read the file and upload to MongoDB
fs.readFile(filename, async (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    process.exit(1);
  }

  const newDoc = new Doc({
    directory: project, // Set directory to project name
    filename: filename,
    data: data,
    mimetype: getFileMimeType(filename)
  });

  try {
    await newDoc.save();
    console.log(`File "${filename}" uploaded to project "${project}".`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Error uploading file:', err);
    mongoose.disconnect();
    process.exit(1);
  }
});

// Function to get MIME type of a file
function getFileMimeType(filename) {
  const parts = filename.split('.');
  const extension = parts[parts.length - 1];

  switch (extension.toLowerCase()) {
    case 'txt':
      return 'text/plain';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
