import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
    console.log("Received analyze request:", req.body);
  try {
    const { prompt } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `Evaluate this AI prompt using this rubric:
- clarity
- specificity
- context
- constraints
- outputFormat

Return JSON only with:
{
  "scores": {
    "clarity": number,
    "specificity": number,
    "context": number,
    "constraints": number,
    "outputFormat": number
  },
  "feedback": ["..."],
  "improvedPrompt": "..."
}

Each score should be from 1 to 5.

Prompt:
${prompt}`,
    });
let text = response.output_text;

console.log("========== AI RESPONSE ==========");
console.log(text);

// Remove ```json and ``` if the AI wraps JSON in a code block
text = text.replace(/```json/g, "").replace(/```/g, "").trim();

const data = JSON.parse(text);

res.json(data);

    res.json(data);
  }   catch (error) {
  console.log("========== OPENAI ERROR ==========");
  console.dir(error, { depth: null });

  res.status(500).json({
    error: error.message,
  });
}

  if (error.response) {
    console.error(error.response.data);
  }

  res.status(500).json({
    error: error.message,
  });
}
,);


app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});