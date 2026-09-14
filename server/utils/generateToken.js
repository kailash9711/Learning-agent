
import jwt from "jsonwebtoken";


export const generateToken = (user,statuscode, message, res) => {
   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
            
    const isProduction = process.env.NODE_ENV === "production";

    res.status(statuscode).cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    }).json({
        success: true,
        user,
        message,
        token,
    });

};