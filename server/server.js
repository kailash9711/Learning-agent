import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
} catch (error) {
  console.error("DB Connection Failed:", error.message);
  process.exit(1);
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Required for HttpOnly cookies
}));

//static folder
app.use(express.static(path.join(__dirname, "public")));
// Test Route
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

app.use(errorHandler);
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

//server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
