const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import model
const Entry = require("./result");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/soulscript", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// API route
app.post("/api/submit", async (req, res) => {
  try {
    const { mood, energy, questions, journalEntry, score } = req.body;
    const entry = new Entry({ mood, energy, questions, journalEntry, score });
    await entry.save();
    res.json({ message: "Saved successfully", entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
