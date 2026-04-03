import express from "express";
import {body} from "express-validator";

import{
register, login , logout, getUser} from "./auth.Controller.js";
import { isAuth } from "../../middleware/authMiddleware.js";


const router = express.Router();

// Validation middleware

const registerValidation = [
  body("username").notEmpty().trim().isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];


// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.get("/user",isAuth, getUser);
// router.put("/profile", isAuth, updateProfile);


export default router;