import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import {
  createJobService,
  getJobByIdService,
  applyToJobService,
  getJobApplicantsService,
} from "./jobs.service";
import { validateBody } from "../../utils/validate";
import {
  createJobSchema,
  applyToJobSchema,
} from "../../validations/job.validation";
import {
  getPagination,
  getSorting,
  getPaginationMeta,
} from "../../utils/pagination";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { AppError } from "../../utils/AppError";

export const createJob = asyncHandler(async (req: any, res: Response) => {
  const validatedData = validateBody(createJobSchema, {
    ...req.body,
    salaryMin:
      req.body.salaryMin !== undefined && req.body.salaryMin !== ""
        ? Number(req.body.salaryMin)
        : null,
    salaryMax:
      req.body.salaryMax !== undefined && req.body.salaryMax !== ""
        ? Number(req.body.salaryMax)
        : null,
  });

  const job = await createJobService(validatedData, req.user.userId);

  return sendSuccess({
    res,
    statusCode: 201,
    message: "Job created successfully",
    data: { job },
  });
});

export const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);

  const orderBy = getSorting(
    req.query,
    ["createdAt", "title", "location", "jobType"],
    "createdAt"
  );

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        company: true,
      },
    }),
    prisma.job.count(),
  ]);

  return sendSuccess({
    res,
    message: "Jobs retrieved successfully",
    data: {
      jobs,
      pagination: getPaginationMeta(total, page, limit),
    },
  });
});

export const getMyJobs = asyncHandler(async (req: any, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);

  const orderBy = getSorting(
    req.query,
    ["createdAt", "title", "location", "jobType"],
    "createdAt"
  );

  const where = {
    createdById: req.user.userId,
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        company: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  return sendSuccess({
    res,
    message: "My jobs retrieved successfully",
    data: {
      jobs,
      pagination: getPaginationMeta(total, page, limit),
    },
  });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const job = await getJobByIdService(id);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return sendSuccess({
    res,
    message: "Job retrieved successfully",
    data: { job },
  });
});

export const applyToJob = asyncHandler(async (req: any, res: Response) => {
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

  return sendSuccess({
    res,
    statusCode: 201,
    message: "Application submitted successfully",
    data: { application },
  });
});

export const getMyApplications = asyncHandler(
  async (req: any, res: Response) => {
    const { page, limit, skip } = getPagination(req.query);

    const orderBy = getSorting(
      req.query,
      ["appliedAt", "status"],
      "appliedAt"
    );

    const where = {
      candidateId: req.user.userId,
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return sendSuccess({
      res,
      message: "Applications retrieved successfully",
      data: {
        applications,
        pagination: getPaginationMeta(total, page, limit),
      },
    });
  }
);

export const getJobApplicants = asyncHandler(
  async (req: any, res: Response) => {
    const applicants = await getJobApplicantsService(
      req.params.jobId,
      req.user.userId
    );

    return sendSuccess({
      res,
      message: "Job applicants retrieved successfully",
      data: { applicants },
    });
  }
);