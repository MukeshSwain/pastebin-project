import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import pasteRoutes from "./routes/paste.routes.js";
const app = express();

app.use(cors(
  {
    origin: process.env.BASE_URL || "http://localhost:5173",
    credentials: true
  }
));
app.use(express.json());

app.get("/api/healthz", async (req, res) => {
    try {
      console.log("healthz");
    await pool.query("SELECT 1");
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.use( pasteRoutes);

export default app;
