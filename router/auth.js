import express from "express";
import { Login, Register, UpdateUser } from "../controller/auth.js";
const router = express.Router();

router.post("/login", Login);
router.post("/register", Register);
router.patch("/update/:id", UpdateUser);
export default router;
