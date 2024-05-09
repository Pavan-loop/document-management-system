// get.js

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

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
  mimetype: String,
  version: { type: Number, default: 1 } // Include version field in the schema
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
  .then(async doc => {
    if (!doc) {
      console.error('File not found:', filename);
      mongoose.disconnect();
      process.exit(1);
    }

    // Create "retrieved" folder if it doesn't exist
    const folder = './retrieved';
    await fs.mkdir(folder, { recursive: true });

    // Prepare filename with version number
    const parts = filename.split('.');
    const basename = parts.slice(0, -1).join('.');
    const extension = parts[parts.length - 1];
    let updatedFilename = filename;
    let version = doc.version;

    // Check if the file already exists in the "retrieved" folder
    const filePath = path.join(folder, updatedFilename);
    try {
      await fs.access(filePath);
      // File already exists, extract version from filename
      const regex = new RegExp(`${basename}(v(\\d+))\\.${extension}`);
      const match = filename.match(regex);
      if (match && match[1]) {
        const fileVersion = parseInt(match[1].substring(1));
        // Ensure version number matches the one stored in the database
        if (fileVersion >= version) {
          version = fileVersion + 1;
        }
      }
      updatedFilename = `${basename}(v${version}).${extension}`;
    } catch (err) {
      // File doesn't exist, continue with the original filename
    }

    // Write the file data to the "retrieved" folder
    await fs.writeFile(`${folder}/${updatedFilename}`, doc.data);
    console.log(`File "${filename}" retrieved and stored as "${updatedFilename}" in "retrieved" folder.`);

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error retrieving file:', err);
    mongoose.disconnect();
    process.exit(1);
  });
