import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { getJson } from "serpapi";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Allowed origins
const allowedOrigins = [
  "https://intelligentmanage.netlify.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://business-consultant-agent.onrender.com",
  "https://project-netaji.netlify.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / curl / server-to-server
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Validate environment variables
if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is not set in environment variables");
  process.exit(1);
}

if (!process.env.SERPAPI_API_KEY) {
  console.error("SERPAPI_API_KEY is not set in environment variables");
  process.exit(1);
}

// OpenRouter client (OpenAI-compatible)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5174",
    "X-Title": "Business Consultant Agent",
  },
});

// Helper: run SerpAPI search
async function runSerpSearch(query) {
  const searchResults = await getJson({
    engine: "google",
    api_key: process.env.SERPAPI_API_KEY,
    q: query,
    num: 8,
  });

  return (searchResults.organic_results || []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    source: item.source || null,
  }));
}

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Business Consultant Agent backend running (OpenRouter + SerpAPI)",
  });
});

// Raw search endpoint
app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        message: "Invalid request: query must be a string",
      });
    }

    const results = await runSerpSearch(query);

    return res.json({
      query,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      message: "An error occurred while searching",
      error: error.message,
    });
  }
});

// Main chat endpoint (SerpAPI + OpenRouter)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        message: "Invalid request: messages must be an array",
      });
    }

    // Get latest user message
    const latestUserMessage =
      [...messages].reverse().find((msg) => msg.role === "user")?.content || "";

    if (!latestUserMessage) {
      return res.status(400).json({
        message: "No user message found in messages array",
      });
    }

    // Research queries based on user question
    const researchQueries = [
      latestUserMessage,
      `${latestUserMessage} market size trends competitors`,
      `${latestUserMessage} risks opportunities business strategy`,
    ];

    // Run SerpAPI searches in parallel
    const researchResultsArrays = await Promise.all(
      researchQueries.map((q) => runSerpSearch(q))
    );

    // Flatten + dedupe
    const seenLinks = new Set();
    const researchResults = researchResultsArrays
      .flat()
      .filter((item) => {
        if (!item.link || seenLinks.has(item.link)) return false;
        seenLinks.add(item.link);
        return true;
      })
      .slice(0, 10);

    const researchText = researchResults
      .map(
        (item, index) =>
          `${index + 1}. ${item.title}\nURL: ${item.link}\nSnippet: ${
            item.snippet || "No snippet"
          }`
      )
      .join("\n\n");

    const defaultSystemPrompt = `
You are an expert AI Business Consultant.

You must answer using a structured 6-phase business consulting style:
1. Input Understanding
2. Research Insights
3. Analysis
4. Strategy Recommendations
5. Synthesis / Executive Summary
6. Actionable Next Steps

Rules:
- Be practical, strategic, and concise
- Base conclusions on the provided search research
- Clearly separate facts from assumptions
- Mention risks and opportunities
- Give a founder-friendly action plan
- Use bullet points and sections
- If evidence is limited, explicitly say so
`;

    const finalPrompt = `
${systemPrompt || defaultSystemPrompt}

USER BUSINESS QUESTION:
${latestUserMessage}

REAL-TIME WEB RESEARCH RESULTS:
${researchText}

Please provide:
- Executive Summary
- Market / Competitor Insights
- Opportunities
- Risks
- Strategic Recommendations
- 30-Day Action Plan
- 90-Day Action Plan
- Final Verdict
`;

    // Use OpenRouter free-friendly model
    const completion = await openai.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        {
          role: "system",
          content:
            "You are a high-quality AI business consultant focused on strategy, market analysis, and startup advisory.",
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    });

    const reply =
      completion.choices?.[0]?.message?.content || "No response generated.";

    return res.json({
      reply,
      research: researchResults,
    });
  } catch (error) {
    console.error("Chat error:", error);

    // Better OpenRouter error extraction
    const providerError =
      error?.response?.data ||
      error?.error ||
      error?.message ||
      "Unknown provider error";

    return res.status(500).json({
      message: "An error occurred while processing your request",
      error:
        typeof providerError === "string"
          ? providerError
          : JSON.stringify(providerError),
    });
  }
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  return res.status(500).json({
    message: "Something broke!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});