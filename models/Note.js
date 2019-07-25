// Require Mongoose
var mongoose = require('mongoose');

// Create a Schema Class
var Schema = mongoose.Schema;

// Create Comment Schema
var NoteSchema = new Schema({

  // Author's Name
  title: String,
  body: String
  });


// Create the Comment model with Mongoose
var Note = mongoose.model('Note', NoteSchema);

// Export the Model
module.exports = Note;