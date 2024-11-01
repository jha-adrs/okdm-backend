import { UploadApiResponse } from "cloudinary";
import prisma from "../config/db"
import logger from "../config/logger";
import { cloudinaryService } from "../utils/cloudinary";
import { ProfileActionButtonType, UserDesignation, UserProfile } from "@prisma/client";
import { userService } from "./user.service";

export const profileService = {
    getPublicProfile: async (userID: string) => {

        const profile = await prisma.userProfile.findFirst({
            where: {
                userId: userID
            },
            include: {
                UserLinks: true,
                User: {
                    select: {
                        username: true
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
            }, select: {
                profile_url: true,
                headline: true,
                bio: true,
                avatar: true,
                location: true,
                website: true,
                designation: true,
                designation_location: true,
                theme: true,
                background_color: true,
                background_image: true,
                action_button_type: true,
                action_button_text: true,
                action_button_link: true,
                seo_title: true,
                seo_description: true,
                seo_keywords: true,
                UserLinks: true
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
                background_image: data,
                background_color: null
            }
        } else {
            query = {
                background_color: data,
                background_image: null
            }
        }
        const updatedProfile = await prisma.userProfile.update({
            where: {
                userId: userID
            },
            data: query
        });
        return updatedProfile;
    },
    updateProfile: async (userID: string, data: {
        headline?: string,
        bio?: string,
        location?: string,
        website?: string,
        designation?: UserDesignation,
        designation_location?: string,
        action_button_type?: ProfileActionButtonType,
        action_button_text?: string,
        action_button_link?: string,
        seo_title?: string,
        seo_description?: string,
        seo_keywords?: string
    }) => {
        const existingProfile = await prisma.userProfile.findFirst({
            where: {
                userId: userID
            }
        });
        if (!existingProfile) {
            throw new Error("Profile not found")
        }
        const query: Partial<UserProfile> = {};
        if (data.bio) {
            query.bio = data.bio
        }
        if (data.designation) {
            query.designation = data.designation
        }
        if (data.designation_location) {
            query.designation_location = data.designation_location
        }
        if (data.headline) {
            query.headline = data.headline
        }
        if (data.location) {
            query.location = data.location
        }
        if (data.website) {
            query.website = data.website
        }
        if (data.action_button_type) {
            query.action_button_type = data.action_button_type
        }
        if (data.action_button_text) {
            query.action_button_text = data.action_button_text
        }
        if (data.action_button_link) {
            query.action_button_link = data.action_button_link
        }
        if (data.seo_title) {
            query.seo_title = data.seo_title || existingProfile.seo_title
        }
        if (data.seo_description) {
            query.seo_description = data.seo_description || existingProfile.seo_description
        }
        if (data.seo_keywords) {
            query.seo_keywords = data.seo_keywords || existingProfile.seo_keywords
        }


        const updatedProfile = await prisma.userProfile.update({
            where: {
                userId: userID
            },
            data: query
        });
        return updatedProfile;
    },
    updateUsername: async (userID: string, username: string) => {
        const isTaken = await userService.isUsernameTaken(username);
        if (isTaken) {
            throw new Error("Username is taken")
        }

    }
}