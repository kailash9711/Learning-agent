import express from 'express';
import { getActivityStats } from './user.controller.js';
import { isAuth } from "../../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get('/stats', isAuth, getActivityStats);

export default userRouter;
