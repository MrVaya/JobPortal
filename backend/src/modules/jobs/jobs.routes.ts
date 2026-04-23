import { Router } from "express";
import { resumeUpload } from "../../middleware/upload.middleware";
import {
    createJob,
    getMyJobs,
    getAllJobs,
    getJobById,
    applyToJob,
    getMyApplications,
    getJobApplicants,
} from "./jobs.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();
router.get("/", getAllJobs);

router.get(
    "/my-applications",
    authMiddleware,
    requireRole("CANDIDATE"),
    getMyApplications
);

router.post(
  "/:jobId/apply",
  authMiddleware,
  requireRole("CANDIDATE"),
  resumeUpload.single("resume"),
  applyToJob
);

router.post("/", authMiddleware, requireRole("EMPLOYER"), createJob);

router.get(
    "/my-jobs",
    authMiddleware,
    requireRole("EMPLOYER"),
    getMyJobs
);

router.get(
    "/:jobId/applicants",
    authMiddleware,
    requireRole("EMPLOYER"),
    getJobApplicants
);

router.get("/:id", getJobById);

export default router;