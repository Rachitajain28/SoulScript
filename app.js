// 🌿 SoulScript - Complete Emotional Index System (Final Research Version)
// This file handles all logic: mood → energy → questionnaire → journal → emotional index

//-------------------------------------------------------------
// 🧩 PAGE 1: mood.html → Save Mood and Energy
//-------------------------------------------------------------
function saveMoodEnergy() {
  const mood = document.querySelector('input[name="mood"]:checked')?.value;
  const energy = document.getElementById("energy")?.value;

  if (!mood || !energy) {
    alert("⚠️ Please select both mood and energy level.");
    return;
  }

  // Store mood and energy in localStorage for later use
  localStorage.setItem("mood", mood);
  localStorage.setItem("energy", energy);

  // Move to next page (questions)
  window.location.href = "ques.html";
}

//-------------------------------------------------------------
// 🧠 PAGE 2: ques.html → Save Guided Question Responses
//-------------------------------------------------------------
function saveQuestions() {
  const responses = document.querySelectorAll(".quiz input[type='radio']:checked");
  if (responses.length < 10) {
    alert("⚠️ Please answer all questions.");
    return;
  }

  let yesCount = 0;
  responses.forEach(res => {
    if (res.value === "Yes") yesCount++;
  });

  // Store anxiety-related yes-count
  localStorage.setItem("questionScore", yesCount);

  // Move to journal writing page
  window.location.href = "journal.html";
}

//-------------------------------------------------------------
// ✍️ PAGE 3: journal.html → Analyze Journal Sentiment (Local)
//-------------------------------------------------------------
function analyzeJournal() {
  const text = document.getElementById("textBox").value.toLowerCase().trim();
  if (!text) {
    alert("⚠️ Please write something in your journal.");
    return;
  }

  // Basic emotion dictionary
  const positive = ["happy", "joy", "love", "grateful", "peace", "calm", "hopeful", "excited", "proud"];
  const negative = ["sad", "depressed", "tired", "angry", "anxious", "lonely", "hopeless", "worried", "fear"];

  let pos = 0, neg = 0;
  text.split(/\s+/).forEach(word => {
    if (positive.includes(word)) pos++;
    if (negative.includes(word)) neg++;
  });

  let sentimentScore = 0.5 + (pos - neg) / (pos + neg + 1);
  sentimentScore = Math.max(0, Math.min(1, sentimentScore));

  localStorage.setItem("sentimentScore", sentimentScore);
  window.location.href = "dashboard.html";
}

//-------------------------------------------------------------
// 📊 PAGE 4: dashboard.html → Calculate & Display Emotional Index
//-------------------------------------------------------------
function calculateEmotionalIndex() {
  const mood = parseInt(localStorage.getItem("mood")) || 3;
  const energy = parseInt(localStorage.getItem("energy")) || 5;
  const questionScore = parseInt(localStorage.getItem("questionScore")) || 0;
  const sentimentScore = parseFloat(localStorage.getItem("sentimentScore")) || 0.5; 


  // Weighted contributions (research-based)
  const M = mood / 5;
  const E = energy / 10;
  const Q = (10 - questionScore) / 10; // more Yes → lower score
  const S = sentimentScore; // already normalized
  // Combine and normalize 0–100
  const EI = (0.3 * M) + (0.2 * E) + (0.3 * Q) + (0.2 * S);
  localStorage.setItem("emotionalIndex", EI);
  return EI;

}
async function sendToBackend() {
  const mood = localStorage.getItem("mood");
  const energy = localStorage.getItem("energy");
  const questions = localStorage.getItem("questionScore"); // If you want to send detailed answers, adjust this
  const journalEntry = localStorage.getItem("sentimentScore"); // If you want the full text, store it separately
  const score = localStorage.getItem("emotionalIndex");

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
}


function showResults() {
  const EI = calculateEmotionalIndex();
  let level = "";
  let description = "";
  let suggestion = "";
  let color = "";

  if (EI >= 0.75) {
    level = "Low Depression Risk 😊";
    description = "Positive emotions and stable energy — maintain your self-care habits!";
    color = "#2ecc71";
    suggestion = "You’re emotionally stable! Continue journaling gratitude and staying connected with loved ones.";
  } else if (EI >= 0.5) {
    level = "Mild Depression Risk 🙂";
    description = "Occasional stress or low energy — try relaxation and mindful breathing.";
    suggestion = "You're in a balanced state but may have occasional dips. Try music, meditation, or light activity.";
    color = "#f1c40f";
  } else if (EI >= 0.25) {
    level = "Moderate Depression Risk 😐";
    description = "Signs of persistent anxiety or negativity — consider regular journaling or counseling.";
    color = "#e67e22";
  }else {
    level = "High Depression Risk 😔";
    suggestion = "You seem emotionally low. Try deep breathing, journaling positive moments, or talking to a counselor.";
    description = "Severe sadness or distress detected — seek help, reach out to loved ones, or talk to a counselor.";
    color = "#e74c3c";
  }

  // Display data
  document.getElementById("emotionalIndex").textContent = (EI * 100).toFixed(1);
  document.getElementById("emotionalIndex").style.color = color;
  document.getElementById("emotionalLevel").textContent = level;
  document.getElementById("suggestions").textContent = suggestion;
  document.getElementById("description").textContent = description;
  sendToBackend();
}

//-------------------------------------------------------------
// 🚀 EXECUTION LOGIC — Runs on Each Page Automatically
//-------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("mood.html")) {
    // Mood Page → button triggers saveMoodEnergy()
    document.querySelector(".btn-next")?.addEventListener("click", saveMoodEnergy);
  } 
  else if (path.includes("ques.html")) {
    // Questionnaire Page → button triggers saveQuestions()
    document.getElementById("form-submit")?.addEventListener("click", e => {
      e.preventDefault();
      saveQuestions();
    });
  } 
  else if (path.includes("journal.html")) {
    // Journal Page → button triggers analyzeJournal()
    document.getElementById("text-submit")?.addEventListener("click", e => {
      e.preventDefault();
      analyzeJournal();
    });
  } 
  else if (path.includes("dashboard.html")) {
    // Dashboard → automatically show results
    showResults();
  }
});


  