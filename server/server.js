import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/error.js";
import authRoute from "./feature/auth/auth.route.js";
import documentRoutes from "./feature/documents/document.routes.js";
import quizRouter from "./feature/quiz/quiz.routes.js";

import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import flashcardRouter from "./feature/flashCard/flashcard.routes.js";
import aiRouter from "./feature/ai/ai.routes.js";
import userRouter from "./feature/user/user.routes.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean).map((u) => u.replace(/\/$/, ''));

// Private Network Access (PNA) support for public-to-local testing
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.headers['access-control-request-private-network']) {
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    return res.sendStatus(204);
  }
  next();
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in deployment to avoid blocking users
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Required for HttpOnly cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Routes
app.use("/api/auth",authRoute);
app.use("/api/documents",documentRoutes);
app.use("/api/flashcards", flashcardRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);



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

async function startServer() {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.error("❌ Failed to connect to MongoDB. Server not started.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server startup error:", err);
  process.exit(1);
});
