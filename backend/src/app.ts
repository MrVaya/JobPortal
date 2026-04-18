import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";

import { requireRole } from "./middleware/role.middleware";

import jobRoutes from "./modules/jobs/jobs.routes";
const app = express();


app.get("/api/protected", authMiddleware, (req: any, res) => {
    res.json({
        message: "You are authorized",
        user: req.user,
    });
});

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API running");
});

app.use("/api/auth", authRoutes);

app.get(
    "/api/employer-only",
    authMiddleware,
    requireRole("EMPLOYER"),
    (req: any, res) => {
        res.json({ message: "Employer access granted" });
    }
);

app.use("/api/jobs", jobRoutes);

export default app;