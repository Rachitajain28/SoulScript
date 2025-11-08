const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  mood: Number,
  energy: Number,
  questions: Number,
  journalEntry: String,
  score: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("entries", entrySchema);
