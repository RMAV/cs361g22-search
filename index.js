import express from "express";
import cors from "cors";
import { items } from "./items.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "cs361g22-search" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "cs361g22-search",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// GET /search
app.get("/search", (req, res) => {
  try {
    let q = req.query.query ?? "";
    q = q.toLowerCase().trim();

    // If empty query then return empty list and not error
    if (!q) {
      return res.json({
        status: "success",
        query: "",
        count: 0,
        results: []
      });
    }

    const results = items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q)
    );

    return res.json({
      status: "success",
      query: q,
      count: results.length,
      results
    });

  } catch (err) {
    console.error("Search microservice error:", err);

    return res.status(500).json({
      status: "error",
      message: "Internal search error"
    });
  }
});

app.listen(3000, () => {
  console.log("Search microservice running on port 3000");
});
