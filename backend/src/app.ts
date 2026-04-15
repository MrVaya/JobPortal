import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API is running...");
});

app.get("/api/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            success: true,
            message: "Backend and database are running",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error,
        });
    }
});

export default app;