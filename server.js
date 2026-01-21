const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Entry = require("./models/result");
const jwt = require("jsonwebtoken");


const app = express();


// CORS setup
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(bodyParser.json());

app.use(express.json());

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, "SOULSCRIPT_SECRET");
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Auth routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);






// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/SoulScript", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("DB Connection Error:", err));
mongoose.connection.once("open", () => {
  console.log("Connected to database:", mongoose.connection.name);
});


// API route
app.post("/api/submit", authMiddleware, async (req, res) => {
  try {
    let { mood, energy, questions, journalEntry, score } = req.body;


    mood = Number((mood + "").replace(/['"]+/g, ""));
    energy = Number((energy + "").replace(/['"]+/g, ""));
    questions = Number((questions + "").replace(/['"]+/g, ""));
    score = Number((score + "").replace(/['"]+/g, ""));

    console.log("Data Before Save:", { mood, energy, questions, journalEntry, score });

    const entry = new Entry({
      userId: req.userId,
      mood: Number(mood),
      energy: Number(energy),
      questions: Number(questions),
      journalEntry,
      score: Number(score),
      sentimentScore: req.body.sentimentScore || 0.5
    });
    await entry.save();

    console.log("Entry saved to MongoDB:", entry);
    res.json({ message: "Data received successfully", data: entry });

  } catch (err) {
    console.error("Error in saving entry:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== HISTORY APIs =====

// Mood distribution
app.get("/api/history/mood", authMiddleware, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId });
  const moodCount = {};

  entries.forEach(e => {
    moodCount[e.mood] = (moodCount[e.mood] || 0) + 1;
  });

  res.json(moodCount);
});

// Energy over time
app.get("/api/history/energy", authMiddleware, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId })
    .sort({ createdAt: 1 });

  res.json(entries.map(e => ({
    date: e.createdAt,
    energy: e.energy
  })));
});

// Emotional Index history
app.get("/api/history/emotional-index", authMiddleware, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId })
    .sort({ createdAt: 1 });

  res.json(entries.map(e => ({
    date: e.createdAt.toISOString().split("T")[0],
    value: Math.round(e.score * 100)
  })));
});

// Full history list
app.get("/api/history/all", authMiddleware, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId })
    .sort({ createdAt: -1 });

  res.json(entries);
});




//Starting server
const PORT = 5050;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));





