import { Router } from "express";
import { createPaste,fetchPaste, viewPasteHtml } from "../controller/paste.controller.js";
const router = Router();
router.post("/api/pastes", createPaste);
router.get("/api/pastes/:id", fetchPaste);

router.get("/p/:id",viewPasteHtml);

export default router;
