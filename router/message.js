import express from "express";
import { getMessages, sendMessage } from "../controller/message.js";
import { auth } from "../middleware/protect.js";
const router = express.Router();
router.get("/getMessages/:id", auth, getMessages);
router.post("/sendMessage", auth, sendMessage);
export default router;
