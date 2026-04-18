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

export const createJob = async (req: any, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is required",
            });
        }

        const job = await createJobService(req.body, req.user.userId);

        return res.status(201).json({
            success: true,
            job,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyJobs = async (req: any, res: Response) => {
    try {
        const jobs = await getMyJobsService(req.user.userId);

        return res.status(200).json({
            success: true,
            jobs,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await getAllJobsService(req.query);

        return res.status(200).json({
            success: true,
            jobs,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
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
            job,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const applyToJob = async (req: any, res: Response) => {
    try {
        const application = await applyToJobService(
            req.params.jobId,
            req.user.userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            application,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyApplications = async (req: any, res: Response) => {
    try {
        const applications = await getMyApplicationsService(req.user.userId);

        return res.status(200).json({
            success: true,
            applications,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
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
            applicants,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};