const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function checkModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
        console.log("AVAILABLE MODELS FOR THIS KEY:");
        data.models.forEach(m => {
            if(m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent")) {
                console.log("-", m.name.replace('models/', ''));
            }
        });
    } else {
        console.log("Error or no models format:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkModels();
