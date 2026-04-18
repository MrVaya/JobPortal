import prisma from "../../lib/prisma";

export const createJobService = async (data: any, userId: string) => {
    const {
        title,
        description,
        location,
        jobType,
        salaryMin,
        salaryMax,
    } = data;

    const count = await prisma.job.count();

    const jobCode = `JOB-${String(count + 1).padStart(3, "0")}`;

    const employer = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
    });

    if (!employer) {
        throw new Error("User not found");
    }

    if (!employer.companyId) {
        throw new Error("Employer is not linked to any company");
    }

    const job = await prisma.job.create({
        data: {
            title,
            description,
            location,
            jobType,
            salaryMin,
            salaryMax,
            companyId: employer.companyId,
            createdById: employer.id,
            jobCode,
        },
    });

    return job;
};

export const getMyJobsService = async (userId: string) => {
    const jobs = await prisma.job.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: "desc" },
    });

    return jobs;
};

export const getAllJobsService = async (query: any) => {
    const { keyword, location, jobType, minSalary, maxSalary } = query;

    return await prisma.job.findMany({
        where: {
            status: "OPEN",

            AND: [
                keyword
                    ? {
                        OR: [
                            { title: { contains: keyword, mode: "insensitive" } },
                            { description: { contains: keyword, mode: "insensitive" } },
                        ],
                    }
                    : {},

                location
                    ? {
                        location: { contains: location, mode: "insensitive" },
                    }
                    : {},

                jobType
                    ? {
                        jobType: jobType,
                    }
                    : {},

                minSalary
                    ? {
                        salaryMin: { gte: Number(minSalary) },
                    }
                    : {},

                maxSalary
                    ? {
                        salaryMax: { lte: Number(maxSalary) },
                    }
                    : {},
            ],
        },

        include: {
            company: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};
export const getJobByIdService = async (jobId: string) => {
    return await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            company: true,
        },
    });
};


export const getMyApplicationsService = async (userId: string) => {
    return await prisma.application.findMany({
        where: { candidateId: userId },
        include: {
            job: {
                include: {
                    company: true,
                },
            },
        },
        orderBy: {
            appliedAt: "desc",
        },
    });
};

export const applyToJobService = async (
    jobId: string,
    userId: string,
    data: any
) => {
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw new Error("Job not found");
    }

    // prevent duplicate apply
    const existing = await prisma.application.findUnique({
        where: {
            jobId_candidateId: {
                jobId,
                candidateId: userId,
            },
        },
    });

    if (existing) {
        throw new Error("You already applied to this job");
    }

    const application = await prisma.application.create({
        data: {
            jobId,
            candidateId: userId,
            coverLetter: data.coverLetter,
            resumeUrl: data.resumeUrl,
            resumeFileName: data.resumeFileName,
            resumeFileType: data.resumeFileType,
        },
    });




    return application;
};

export const getJobApplicantsService = async (
    jobId: string,
    userId: string
) => {
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw new Error("Job not found");
    }

    if (job.createdById !== userId) {
        throw new Error("Unauthorized");
    }

    return await prisma.application.findMany({
        where: { jobId },
        include: {
            candidate: true,
        },
        orderBy: {
            appliedAt: "desc",
        },
    });
};