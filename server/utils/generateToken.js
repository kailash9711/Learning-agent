
import jwt from "jsonwebtoken";


export const generateToken = (user,statuscode, message, res) => {
   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
            
    res.status(statuscode).cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // 7 days
    }).json({
        success: true,
        user,
        message,
        token,
    });

};