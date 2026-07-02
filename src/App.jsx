import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [revisedPrompt, setRevisedPrompt] = useState("");
  const [revisedResult, setRevisedResult] = useState(null);

  function scorePrompt(text) {
    const lower = text.toLowerCase();

    const scores = {
      clarity: text.length > 20 ? 4 : 2,
      specificity:
        lower.includes("specific") ||
        lower.includes("days") ||
        lower.includes("budget") ||
        lower.includes("ingredients")
          ? 4
          : 2,
      context:
        lower.includes("for") ||
        lower.includes("with") ||
        lower.includes("because")
          ? 4
          : 2,
      constraints:
        lower.includes("under") ||
        lower.includes("budget") ||
        lower.includes("must") ||
        lower.includes("no") ||
        lower.includes("only")
          ? 4
          : 2,
      outputFormat:
        lower.includes("table") ||
        lower.includes("list") ||
        lower.includes("steps") ||
        lower.includes("recipe")
          ? 4
          : 2,
    };

    const total =
      scores.clarity +
      scores.specificity +
      scores.context +
      scores.constraints +
      scores.outputFormat;

    const feedback = [];

    if (scores.clarity < 4)
      feedback.push("Make your prompt clearer and more complete.");
    if (scores.specificity < 4)
      feedback.push("Add specific details.");
    if (scores.context < 4)
      feedback.push("Explain who the response is for.");
    if (scores.constraints < 4)
      feedback.push("Include limits or preferences.");
    if (scores.outputFormat < 4)
      feedback.push("Tell the AI what format you want.");

    if (feedback.length === 0) {
      feedback.push("Strong prompt.");
    }

    return { scores, total, feedback };
  }

  const analyzePrompt = async () => {
    console.log("Analyze clicked");
  try {
    const response = await fetch("http://localhost:3001/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const data = await response.json();
console.log("Backend response:", data);

if (!response.ok) {
  alert(data.error);
  return;
}

    const total =
      data.scores.clarity +
      data.scores.specificity +
      data.scores.context +
      data.scores.constraints +
      data.scores.outputFormat;

    setResult({
      scores: data.scores,
      total,
      feedback: data.feedback,
      improvedPrompt: data.improvedPrompt,
    });

    setRevisedResult(null);
  } catch (err) {
    console.error(err);
    alert("Something went wrong connecting to OpenAI.");
  }
};

  const analyzeRevisedPrompt = async () => {
  try {
    const response = await fetch("http://localhost:3001/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: revisedPrompt,
      }),
    });

    const data = await response.json();

    const total =
      data.scores.clarity +
      data.scores.specificity +
      data.scores.context +
      data.scores.constraints +
      data.scores.outputFormat;

    setRevisedResult({
      scores: data.scores,
      total,
      improvement: total - result.total,
    });
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="app">
      <div className="header">

        <h1>Prompt Lab</h1>
        <br></br>
        <p className="subtitle">
          Improve your AI prompting skills through feedback and revision.
        </p>
      </div>

      <div className="card">
        <textarea
          rows="8"
          placeholder="Enter a prompt you would ask an AI tool..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button onClick={analyzePrompt}>Analyze Prompt</button>
      </div>

      {result && (
        <div className="card">
          <div className="badge">
            {result.total >= 20
              ? "Strong Prompt"
              : result.total >= 15
              ? "Moderate Prompt"
              : "Weak Prompt"}
          </div>

          <h2 className="score-title">Total Score: {result.total}/25</h2>

          <div className="progress-bg">
            <div
              className="progress-fill"
              style={{ width: `${(result.total / 25) * 100}%` }}
            />
          </div>

          <h3 className="section-title">Category Scores</h3>
          <ul>
            <li>Clarity: {result.scores.clarity}/5</li>
            <li>Specificity: {result.scores.specificity}/5</li>
            <li>Context: {result.scores.context}/5</li>
            <li>Constraints: {result.scores.constraints}/5</li>
            <li>Output Format: {result.scores.outputFormat}/5</li>
          </ul>

          <h3 className="section-title">Feedback</h3>
          <ul>
            {result.feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="section-title">Improved Prompt Example</h3>
          <div className="improved-box">{result.improvedPrompt}</div>

          <h3 className="section-title">Your Revised Prompt</h3>
          <textarea
            rows="6"
            placeholder="Rewrite your prompt here..."
            value={revisedPrompt}
            onChange={(e) => setRevisedPrompt(e.target.value)}
          />

          <button onClick={analyzeRevisedPrompt}>
            Analyze Revised Prompt
          </button>

          {revisedResult && (
            <div className="revision-result">
              <h3>Revised Prompt Score: {revisedResult.total}/25</h3>
              <p>Original Score: {result.total}/25</p>
              <p>Improvement: +{revisedResult.improvement}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;