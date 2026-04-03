import express from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import User from "../user/user.model.js";

import { generateToken } from "../../utils/generateToken.js";


export const register = asyncHandler(async (req, res) => {
    
    const { username, email, password } = req.body;
    if (!username || !email || !password ) {
        return res.status(400).json({ success: false, error: "Please provide name, email, and password" });
    }

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ success: false, error: "User already exists" });
    }
    
    user = await User.create({ username, email, password });
    await user.save();
    generateToken(user, 201, "User registered successfully", res);

});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password ) {
        return res.status(400).json({ success: false, error: "Please provide email and password" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(400).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ success: false, error: "Invalid email or password or role" });
    }
    generateToken(user, 200, "User logged in successfully", res);
}   );


export const logout= asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: "User logged out successfully" });
});

export const getUser= asyncHandler(async (req, res, next) => {
    const user= await User.findById(req.user.id).select("-password");

    
    res.status(200).json({ success: true, user });

});

