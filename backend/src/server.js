
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Bishop Wasonga Foundation API",
  });
});

// Public API routes
app.use("/api", publicRoutes);

// Administrator authentication routes
app.use("/api/admin-auth", adminAuthRoutes);

// Admin API routes
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Bishop Wasonga Foundation API running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
