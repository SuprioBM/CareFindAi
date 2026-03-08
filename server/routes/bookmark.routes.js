import express from "express";
import {
  createBookmark,
  getMyBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
} from "../controllers/bookmark.controller.js";

const router = express.Router();

router.post("/", createBookmark);
router.get("/", getMyBookmarks);
router.get("/:id", getBookmarkById);
router.patch("/:id", updateBookmark);
router.delete("/:id", deleteBookmark);

export default router;