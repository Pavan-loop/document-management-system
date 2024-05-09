// delete.js

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
  mimetype: String,
  version: Number // Include version field in the schema
});

const Doc = mongoose.model('Doc', docSchema);

// Retrieve project name and filename from command-line arguments
const project = process.argv[2];
const filename = process.argv[3];

if (!project) {
  console.error('Please provide the project name as an argument.');
  mongoose.disconnect();
  process.exit(1);
}

if (filename) {
  // Delete a specific file from the project
  Doc.findOneAndDelete({ directory: project, filename: filename })
    .then(doc => {
      if (!doc) {
        console.log(`File "${filename}" not found in project "${project}".`);
      } else {
        console.log(`File "${filename}" deleted from project "${project}".`);
      }
      mongoose.disconnect();
    })
    .catch(err => {
      console.error('Error deleting file:', err);
      mongoose.disconnect();
      process.exit(1);
    });
} else {
  // Delete the entire project
  Doc.deleteMany({ directory: project })
    .then(() => {
      console.log(`Project "${project}" deleted.`);
      mongoose.disconnect();
    })
    .catch(err => {
      console.error('Error deleting project:', err);
      mongoose.disconnect();
      process.exit(1);
    });
}
