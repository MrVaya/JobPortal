
import { Readable } from "stream";

import { v2 as cloudinary } from "cloudinary";
import { AppError } from "./AppError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder = "jobportal/resumes"
) {
  if (!file) {
    throw new AppError("File is required", 400);
  }

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(new AppError("Failed to upload file", 500));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

export function generateSignedResumeUrl(publicId: string) {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });
}

export function generateSignedResumeDownloadUrl(publicId: string) {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    secure: true,
    sign_url: true,
    flags: "attachment",
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });
}

export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
}