import { v2 as cloudinary, ResourceOptions, UploadApiOptions, UploadApiResponse } from "cloudinary"
import { config } from "../config/config"
import logger from "../config/logger";

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
});

type UploadImageType = {
    file: Express.Multer.File,
    key: string
} & UploadApiOptions
async function uploadImage({ file, key, folder, access_mode = "private",
    allowed_formats,
    overwrite = true,
}: UploadImageType) {
    try {
        logger.info("Uploading to cloudinary", key, folder, access_mode, allowed_formats, overwrite);
        const result: (Partial<UploadApiResponse> | undefined) =
            await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                    folder,
                    public_id: key,
                    access_mode,
                    allowed_formats,
                    overwrite
                }, (error, result) => {
                    if (error) {
                        logger.error("Error uploading to cloudinary", error);
                        return reject(error);
                    }
                    logger.info("Uploaded to cloudinary ", result?.secure_url, result?.public_id);
                    return resolve(result);
                });
                stream.write(file.buffer);
                stream.end();
            });
        return result;

    } catch (error) {
        logger.error("Error uploading to cloudinary", error);
        return error;
    }

}

async function deleteImage(key: string) {
    return cloudinary.uploader.destroy(key, (error, result) => {
        if (error) {
            logger.error(error);
        }
        logger.info(result);
    });
}

interface CloudinaryImage {
    key: string,
    options: ResourceOptions
}

async function getObject({ key, options }: CloudinaryImage) {
    return cloudinary.image(key, options);
}

export const cloudinaryService = {
    uploadImage,
    deleteImage,
    getObject,
    cloudinaryInstance: cloudinary
}