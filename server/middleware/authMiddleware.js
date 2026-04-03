import { asyncHandler } from "./asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../feature/user/user.model.js";
import { errorHandler } from "./error.js";


export const isAuth = asyncHandler(async (req, res, next) => {

    const {token} = req.cookies;
    if (!token) {
        return res.status(401).json({ success: false, error: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password -resetpasswordexpire -resetpasswordtoken");
    if (!req.user) {
        return res.status(401).json({ success: false, error: "Not authorized, user not found" });
    }
    next();

});