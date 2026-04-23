import { Request, Response } from "express";
import {
  createJobService,
  getMyJobsService,
  getAllJobsService,
  getJobByIdService,
  applyToJobService,
  getMyApplicationsService,
  getJobApplicantsService,
} from "./jobs.service";
import { validateBody } from "../../utils/validate";
import { createJobSchema, applyToJobSchema } from "../../validations/job.validation";

export const createJob = async (req: any, res: Response) => {
  try {
    const validatedData = validateBody(createJobSchema, {
      ...req.body,
      salaryMin:
        req.body.salaryMin !== undefined && req.body.salaryMin !== null
          ? Number(req.body.salaryMin)
          : null,
      salaryMax:
        req.body.salaryMax !== undefined && req.body.salaryMax !== null
          ? Number(req.body.salaryMax)
          : null,
    });

    const job = await createJobService(validatedData, req.user.userId);

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create job",
    });
  }
};

export const getMyJobs = async (req: any, res: Response) => {
    try {
        const jobs = await getMyJobsService(req.user.userId);

        return res.status(200).json({
            success: true,
          message: "Employer jobs retrieved successfully",
            jobs,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
          message: error.message || "Failed to retrieve employer jobs",
        });
    }
};

export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await getAllJobsService(req.query);

        return res.status(200).json({
            success: true,
          message: "Jobs retrieved successfully",
            jobs,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
          message: error.message || "Failed to retrieve jobs",
        });
    }
};

export const getJobById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (Array.isArray(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID",
            });
        }

        const job = await getJobByIdService(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        return res.status(200).json({
            success: true,
          message: "Job retrieved successfully",
            job,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
          message: error.message || "Failed to retrieve job details",
        });
    }
};

export const applyToJob = async (req: any, res: Response) => {
  try {
    const file = req.file;

    const validatedData = validateBody(applyToJobSchema, {
      coverLetter: req.body.coverLetter,
    });

    const application = await applyToJobService(
      req.params.jobId,
      req.user.userId,
      {
        coverLetter: validatedData.coverLetter,
        resumeUrl: file ? `/uploads/resumes/${file.filename}` : null,
        resumeFileName: file ? file.originalname : null,
        resumeFileType: file ? file.mimetype : null,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit job application",
    });
  }
};

export const getMyApplications = async (req: any, res: Response) => {
    try {
        const applications = await getMyApplicationsService(req.user.userId);

        return res.status(200).json({
            success: true,
          message: "Applications retrieved successfully",
            applications,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
          message: error.message || "Failed to retrieve applications",
        });
    }
};

export const getJobApplicants = async (req: any, res: Response) => {
    try {
        const applicants = await getJobApplicantsService(
            req.params.jobId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
          message: "Job applicants retrieved successfully",
            applicants,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
          message: error.message || "Failed to retrieve job applicants",
        });
    }
};