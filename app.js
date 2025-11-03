// app.js - Combined frontend script

// Save to localStorage
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Load from localStorage
function loadData(key) {
  return JSON.parse(localStorage.getItem(key));
}

// ---------------- MOOD PAGE ----------------
if (window.location.pathname.includes("guest.html")) {
  document.querySelector(".btn-next").addEventListener("click", () => {
    const mood = document.querySelector('input[name="mood"]:checked')?.value;
    const energy = document.getElementById("energy").value;

    if (!mood) {
      alert("Please select your mood!");
      return;
    }

    saveData("mood", mood);
    saveData("energy", energy);
  });
}

// ---------------- QUESTIONS PAGE ----------------
if (window.location.pathname.includes("ques.html")) {
  document.getElementById("form-submit").addEventListener("click", (e) => {
    e.preventDefault();

    const answers = {};
    for (let i = 1; i <= 10; i++) {
      const ans = document.querySelector(`input[name="q${i}"]:checked`)?.value;
      if (!ans) {
        alert(`Please answer question ${i}`);
        return;
      }
      answers[`q${i}`] = ans;
    }

    saveData("questions", answers);
  });
}

// ---------------- JOURNAL PAGE ----------------
if (window.location.pathname.includes("journal.html")) {
  document.getElementById("text-submit").addEventListener("click", () => {
    const entry = document.getElementById("textBox").value.trim();
    if (!entry) {
      alert("Please write something in your journal.");
      return;
    }
    saveData("journalEntry", entry);
  });
}

// ---------------- DASHBOARD PAGE ----------------
if (window.location.pathname.includes("dashboard.html")) {
  window.onload = async () => {
    const mood = loadData("mood");
    const energy = loadData("energy");
    const questions = loadData("questions") || {};
    const journalEntry = loadData("journalEntry");

    // Calculate score
    let score = 0;
    if (mood <= 2) score += 3;
    if (mood >= 4) score -= 1;
    if (energy < 4) score += 2;

    Object.values(questions).forEach(ans => {
      if (ans === "Yes") score += 1;
    });

    if (journalEntry && (journalEntry.includes("sad") || journalEntry.includes("tired"))) {
      score += 2;
    }

    let suggestion = "";
    if (score <= 3) {
      suggestion = "🌟 You're doing well today! Keep journaling and enjoy small joys.";
    } else if (score <= 7) {
      suggestion = "💙 You may be feeling low. Try meditation, a walk, or talking to a friend.";
    } else {
      suggestion = "📞 It seems you’re struggling. Please reach out to a trusted person or helpline.";
    }

    document.getElementById("resultMood").innerText = `Mood: ${mood}`;
    document.getElementById("resultEnergy").innerText = `Energy: ${energy}`;
    document.getElementById("resultJournal").innerText = `Journal: ${journalEntry}`;
    document.getElementById("resultSuggestion").innerText = suggestion;

    // Send to backend
    try {
      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, energy, questions, journalEntry, score })
      });
      const data = await res.json();
      console.log("Saved to DB:", data);
    } catch (err) {
      console.error("Backend not connected:", err);
    }
  };
}

