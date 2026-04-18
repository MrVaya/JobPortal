import { Router } from "express";
import { login, register } from "./auth.controller";
import { getMe } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getMe);

router.post("/register", register);
router.post("/login", login);

export default router;