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
   updateApplicationStatus,
} from "./jobs.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/authorize.middleware";
import { USER_ROLES } from "../../constants";
import { getApplicationResume } from "./jobs.controller";
import {
  getOrphanResumeFiles,
  deleteOrphanResumeFiles,
  getStorageStats,
} from "./file-cleanup.controller";
import { validate } from "../../middleware/validate.middleware";
import {
  createJobSchema,
  applyToJobSchema,
} from "../../validations/job.validation";

import { updateApplicationStatusSchema } from "../../validations/application.validation";








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
  authorizeRoles("CANDIDATE"),
  resumeUpload.single("resume"),
  validate(applyToJobSchema),
  applyToJob
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("EMPLOYER"),
  validate(createJobSchema),
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

router.patch(
  "/:jobId/applications/:applicationId/status",
  authMiddleware,
  authorizeRoles("EMPLOYER"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);
router.get("/:id", getJobById);

router.get(
  "/:jobId/applications/:applicationId/resume",
  authMiddleware,
  authorizeRoles("EMPLOYER"),
  getApplicationResume
);

router.get(
  "/storage/stats",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getStorageStats
);

router.get(
  "/storage/orphans",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getOrphanResumeFiles
);

router.delete(
  "/storage/orphans",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteOrphanResumeFiles
);



export default router;