import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/homeviu';

console.log('[Search Service] Connecting to MongoDB...');
mongoose.set("strictQuery", true);
mongoose.connect(MONGODB_URI)
  .then(() => console.log('[Search Service] Connected to MongoDB'))
  .catch(err => {
    console.error('[Search Service] MongoDB connection error:', err.message);
    console.error('[Search Service] Full error:', err);
  });

// Item Schema - matching your main Item model
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  room: String,
  category: String,
  quantity: Number,
  notes: String,
  status: String,
  value: Number,
  description: String,
  userId: { type: String, required: true, index: true },
  dateAdded: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

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
app.get("/search", async (req, res) => {
  try {
    let q = req.query.query ?? "";
    const userId = req.query.userId || req.headers['x-user-id'];
    
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

    // Build filter for user's items
    const filter = userId ? { userId } : {};
    
    // Search by name, location, room, category, or description
    const searchFilter = {
      ...filter,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { room: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    const results = await Item.find(searchFilter)
      .select('_id name location room category description')
      .limit(10)
      .lean();

    // Map _id to id for frontend compatibility
    const formattedResults = results.map(item => ({
      id: item._id.toString(),
      _id: item._id.toString(),
      name: item.name,
      location: item.location,
      room: item.room,
      category: item.category,
      description: item.description
    }));

    return res.json({
      status: "success",
      query: q,
      count: formattedResults.length,
      results: formattedResults
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
