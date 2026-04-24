import express from "express";

import specializationRoutes from "./specialization.routes.js";
import doctorRoutes from "./doctor.routes.js";
import symptomSearchRoutes from "./symptomSearch.routes.js";
import bookmarkRoutes from "./bookmark.routes.js";
import savedLocationRoutes from "./savedLocation.routes.js";
import doctorJoinRequestRoutes from "./doctorJoinRequest.routes.js";
import authRoutes from "./auth.routes.js";
import aiRoutes from "./ai.routes.js";
import analyticsRoutes from "./analytics.router.js";
import triageRoutes from "./triage.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/specializations", specializationRoutes);
router.use("/doctors", doctorRoutes);
router.use("/symptom-searches", symptomSearchRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/saved-locations", savedLocationRoutes);
router.use("/doctor-join-requests", doctorJoinRequestRoutes);
router.use("/ai", aiRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/triage", triageRoutes);

export default router;