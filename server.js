const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Entry = require("./result");

const app = express();

// ✅ CORS setup
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/SoulScript", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));
mongoose.connection.once("open", () => {
  console.log("✅ Connected to database:", mongoose.connection.name);
});

// ✅ API route
app.post("/api/submit", async (req, res) => {
  try {
    let { mood, energy, questions, journalEntry, score } = req.body;

    // 🧹 Clean and convert data safely
    mood = Number((mood + "").replace(/['"]+/g, ""));
    energy = Number((energy + "").replace(/['"]+/g, ""));
    questions = Number((questions + "").replace(/['"]+/g, ""));
    score = Number((score + "").replace(/['"]+/g, ""));

    console.log("📩 Cleaned Data Before Save:", { mood, energy, questions, journalEntry, score });

    const entry = new Entry({
      mood: Number(mood),
      energy: Number(energy),
      questions: Number(questions),
      journalEntry,
      score: Number(score)
    });
    await entry.save();

    console.log("✅ Entry saved to MongoDB:", entry);
    res.json({ message: "Data received successfully", data: entry });

  } catch (err) {
    console.error("❌ Error saving entry:", err);
    res.status(500).json({ error: err.message });
  }
});



// ✅ Start server
const PORT = 5050;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));





