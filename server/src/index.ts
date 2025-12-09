/**
 * Banking Dashboard API Server
 */

import express from "express";
import cors from "cors";
import { config } from "./config";
import { initDatabase, closeDatabase } from "./models/database";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import type { Server } from "node:http";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Initialize database and start server
let server: Server;

initDatabase()
  .then(() => {
    server = app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async () => {
  console.log("\nShutting down gracefully...");

  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  try {
    await closeDatabase();
    console.log("All connections closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
