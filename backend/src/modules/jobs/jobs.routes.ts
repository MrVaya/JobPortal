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
import { authorizeRoles } from "../../middleware/authorize.middleware";
import { USER_ROLES } from "../../constants";

const router = Router();

router.get("/", getAllJobs);

router.get(
  "/my-applications",
  authMiddleware,
  authorizeRoles(USER_ROLES.CANDIDATE),
  getMyApplications
);

router.post(
  "/:jobId/apply",
  authMiddleware,
  authorizeRoles(USER_ROLES.CANDIDATE),
  resumeUpload.single("resume"),
  applyToJob
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(USER_ROLES.EMPLOYER),
  createJob
);

router.get(
  "/my-jobs",
  authMiddleware,
  authorizeRoles(USER_ROLES.EMPLOYER),
  getMyJobs
);

router.get(
  "/:jobId/applicants",
  authMiddleware,
  authorizeRoles(USER_ROLES.EMPLOYER),
  getJobApplicants
);

router.get("/:id", getJobById);

export default router;