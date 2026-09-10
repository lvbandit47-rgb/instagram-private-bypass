require("dotenv").config();

const path = require("node:path");
const express = require("express");
const OpenAI = require("openai");

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/assistant", async (req, res) => {
  const { username, problem, details } = req.body || {};

  if (
    typeof username !== "string" ||
    username.length < 1 ||
    username.length > 30 ||
    typeof problem !== "string" ||
    problem.length < 1 ||
    typeof details !== "string" ||
    details.length > 2000
  ) {
    return res.status(400).json({ error: "Please complete the form with valid details." });
  }

  if (!openai) {
    return res.status(503).json({
      error: "The assistant is not configured yet. Add OPENAI_API_KEY to .env and restart the server."
    });
  }

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions:
        "You are a careful Instagram account-recovery assistant. Give practical, concise steps that use only official Instagram and Meta recovery channels. Never help bypass privacy controls, access another person's account, evade security, or obtain private content. Explain when the user should stop and contact official support. Do not ask for passwords, recovery codes, or authentication tokens.",
      input: [
        `Username: ${username}`,
        `Problem: ${problem}`,
        `Additional details: ${details || "(none provided)"}`
      ].join("\n"),
      max_output_tokens: 500
    });

    const answer = response.output_text?.trim();
    if (!answer) {
      return res.status(502).json({ error: "The assistant returned an empty response. Please try again." });
    }

    return res.json({ answer });
  } catch (error) {
    console.error("Assistant request failed:", error);
    return res.status(502).json({ error: "The assistant is temporarily unavailable. Please try again." });
  }
});

app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  return next(error);
});

app.listen(port, () => {
  console.log(`Recovery assistant listening on http://localhost:${port}`);
});