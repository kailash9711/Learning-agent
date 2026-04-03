
import express from "express";
import { uploadDocument , getDocuments , getDocument  , deleteDocument} from "./document.controller.js";
import upload from "../../config/multer.js";
import { isAuth } from "../../middleware/authMiddleware.js";

const router = express.Router();

// apply authentication middleware to all routes
router.use(isAuth); // Protect all routes below this middleware
 
// Debug endpoint to test auth
router.post("/test-auth", (req, res) => {
    res.json({ message: "Auth working", user: req.user });
});

// Create a new document
router.post("/upload", upload.single('document'), uploadDocument);

// Get all documents
router.get("/", getDocuments);

// // Get a single document by ID
router.get("/:id", getDocument);

// // Delete a document by ID
router.delete("/:id", deleteDocument);

export default router;