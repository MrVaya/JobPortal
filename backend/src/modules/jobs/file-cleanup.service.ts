import prisma from "../../lib/prisma";
import { deleteFromCloudinary } from "../../utils/cloudinary";

export async function findOrphanResumes() {
  const applications = await prisma.application.findMany({
    where: {
      resumePublicId: {
        not: null,
      },
      resumeUrl: null,
    },
    select: {
      id: true,
      resumePublicId: true,
      resumeFileName: true,
    },
  });

  return applications;
}

export async function cleanupOrphanResumes() {
  const orphanFiles = await findOrphanResumes();

  for (const file of orphanFiles) {
    if (file.resumePublicId) {
      await deleteFromCloudinary(file.resumePublicId);
    }
  }

  return {
    deletedCount: orphanFiles.length,
    deletedFiles: orphanFiles,
  };
}

export async function getResumeStorageStats() {
  const totalApplicationsWithResume = await prisma.application.count({
    where: {
      resumePublicId: {
        not: null,
      },
    },
  });

  return {
    totalApplicationsWithResume,
  };
}