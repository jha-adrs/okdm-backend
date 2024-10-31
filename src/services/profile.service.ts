import { UploadApiResponse } from "cloudinary";
import prisma from "../config/db"
import logger from "../config/logger";
import { cloudinaryService } from "../utils/cloudinary";

export const profileService = {
    getPublicProfile: async (userID: string) => {

        const profile = await prisma.userProfile.findFirst({
            where: {
                userId: userID
            },
            select: {
                profile_url: true,
                headline: true,
                bio: true,
                avatar: true,
                location: true,
                website: true,
                designation: true,
                designation_location: true,
                theme: true,
                UserLinks: {
                    where: {
                        isVisible: true
                    }
                },
                User: {
                    select: {
                        username: true,
                        name: true,
                        createdAt: true
                    }
                }
            }
        });
        return profile
    },
    getMyProfile: async (userID: string) => {
        // Private route
        const profile = await prisma.userProfile.findFirst({
            where: {
                userId: userID
            },
            select: {
                profile_url: true,
                headline: true,
                bio: true,
                avatar: true,
                location: true,
                website: true,
                designation: true,
                designation_location: true,
                UserLinks: true,
                userId: false,
                theme: true
            }
        });
        return profile
    },
    updateAvatar: async (userID: string, file: Express.Multer.File) => {
        // Private route
        const uploadResult = await cloudinaryService.uploadImage({
            file,
            key: `avatar/${userID}`,
            access_mode: "public",
            allowed_formats: ["jpg", "png", "jpeg"],
            overwrite: true
        }) as UploadApiResponse;
        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error("Error uploading image")
        }
        const updatedProfile = await prisma.userProfile.update({
            where: {
                userId: userID
            },
            data: {
                avatar: uploadResult.secure_url
            }
        });
        return updatedProfile;
    },
    updateTheme: async (userID: string, theme: string) => {
        // Private route
        const updatedProfile = await prisma.userProfile.update({
            where: {
                userId: userID
            },
            data: {
                theme
            }
        });
        return updatedProfile;
    },
    updateBackgroundImage: async (userID: string, type: "COLOR" | "IMAGE", data: string) => {
        // Private route
        let query;
        if (type === "IMAGE") {
            query = {
                background_image: data
            }
        } else {
            query = {
                background_color: data
            }
        }
        const updatedProfile = await prisma.userProfile.update({
            where: {
                userId: userID
            },
            data: query
        });
        return updatedProfile;
    }
}