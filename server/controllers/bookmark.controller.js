import Bookmark from "../models/bookmark.model.js";

export async function createBookmark(req, res) {
  try {
    const { doctor, savedLocation } = req.body;
    

    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      doctor,
    });

    if (existingBookmark) {
      return res.status(409).json({
        success: false,
        message: "Doctor already bookmarked",
      });
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      doctor,
      savedLocation: savedLocation || null,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor bookmarked successfully",
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create bookmark",
      error: error.message,
    });
  }
}

export async function getMyBookmarks(req, res) {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: "doctor",
        populate: {
          path: "specialization",
        },
      })
      .populate("savedLocation")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookmarks",
      error: error.message,
    });
  }
}

export async function getBookmarkById(req, res) {
  try {
    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate({
        path: "doctor",
        populate: {
          path: "specialization",
        },
      })
      .populate("savedLocation");

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookmark",
      error: error.message,
    });
  }
}

export async function updateBookmark(req, res) {
  try {
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate("doctor")
      .populate("savedLocation");

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookmark updated successfully",
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update bookmark",
      error: error.message,
    });
  }
}

export async function deleteBookmark(req, res) {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete bookmark",
      error: error.message,
    });
  }
}