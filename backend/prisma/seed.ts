import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    // clean old data
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    // password hash
    const hashedPassword = await bcrypt.hash("123456", 10);

    // create company
    const company = await prisma.company.create({
        data: {
            name: "Tech Nepal Pvt Ltd",
            description: "A growing software company",
            location: "Kathmandu",
            website: "https://technepal.com",
        },
    });

    // create employer user
    const employer = await prisma.user.create({
        data: {
            name: "Employer One",
            email: "employer@example.com",
            password: hashedPassword,
            role: "EMPLOYER",
            companyId: company.id,
        },
    });

    // create candidate user
    const candidate = await prisma.user.create({
        data: {
            name: "Candidate One",
            email: "candidate@example.com",
            password: hashedPassword,
            role: "CANDIDATE",
        },
    });

    // create candidate profile
    await prisma.candidateProfile.create({
        data: {
            userId: candidate.id,
            headline: "Junior React Developer",
            bio: "Looking for frontend opportunities",
            skills: "React, Next.js, JavaScript",
            resumeUrl: "resume-sample.pdf",
        },
    });

    // create jobs
    const job1 = await prisma.job.create({
        data: {
            title: "Frontend Developer",
            description: "Build modern web interfaces using React and Next.js.",
            location: "Kathmandu",
            jobType: "Full-time",
            salaryMin: 30000,
            salaryMax: 50000,
            companyId: company.id,
            createdById: employer.id,
        },
    });

    await prisma.job.create({
        data: {
            title: "Backend Developer",
            description: "Work with Node.js, Express, and PostgreSQL.",
            location: "Lalitpur",
            jobType: "Full-time",
            salaryMin: 40000,
            salaryMax: 60000,
            companyId: company.id,
            createdById: employer.id,
        },
    });

    // create application
    await prisma.application.create({
        data: {
            jobId: job1.id,
            candidateId: candidate.id,
            coverLetter: "I am very interested in this role.",
            resumeUrl: "resume-sample.pdf",
        },
    });
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });