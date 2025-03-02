import { Request, Response } from "express";
import { profileValidator } from "../validators/profile.validator";
import { userService } from "../services/user.service";
import httpStatus from "http-status";
import { profileService } from "../services/profile.service";
import logger from "../config/logger";


export const profileController = {
    getPublicProfile: async (req: Request, res: Response) => {
        try {
            const { params: {
                username
            } } = profileValidator.getPublicProfileSchema.parse(req);
            const user = await userService.getUserByUsername(username);
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: "User not found"
                })
            }
            const profile = await profileService.getPublicProfile(user.id);
            return res.status(httpStatus.OK).json({
                profile
            })
        } catch (error) {
            logger.error("ERROR IN PROFILE CONTROLLER, Get Public Profile", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error"
            })
        }
    },
    getMyProfile: async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: "Unauthorized"
                })
            }
            logger.info("User", user.id);
            const userInfo = await userService.getUserById(user.id);
            const profile = await profileService.getMyProfile(user.id);
            return res.status(httpStatus.OK).json({
                user: userInfo,
                profile
            })
        }
        catch (error) {
            logger.error("ERROR IN PROFILE CONTROLLER, Get My Profile", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error"
            })
        }
    },
    updateAvatar: async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: "Unauthorized"
                })
            }
            const file = req.file;
            if (!file) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "Please upload an image"
                })
            }
            logger.info("File", file.path, file.size);
            const profile = await profileService.updateAvatar(user.id, file);
            return res.status(httpStatus.OK).json({
                profile
            })
        } catch (error) {
            logger.error("ERROR IN PROFILE CONTROLLER, Update Avatar", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error"
            })
        }
    },
    updateTheme: async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: "Unauthorized"
                })
            }
            const { body: {
                theme
            } } = req;
            const profile = await profileService.updateTheme(user.id, theme);
            return res.status(httpStatus.OK).json({
                profile
            })
        } catch (error) {
            logger.error("ERROR IN PROFILE CONTROLLER, Update Theme", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error"
            })
        }
    },
    updateBackground: async (req: Request, res: Response) => {
        try {
            const { value, type } = req.body;
            const user = req.user;
            if (!user) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: "Unauthorized"
                })
            }
            logger.info("Update Background", value, type);
            const profile = await profileService.updateBackgroundImage(user.id, type, value);
            return res.status(httpStatus.OK).json({
                profile
            })
        } catch (error) {

        }
    },
    updateProfile: async (req: Request, res: Response) => {
        try {
            const { body } = profileValidator.updateProfile.parse(req);
            const user = req.user;
            if (!user) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: "Unauthorized"
                })
            }
            logger.info("Update Profile", body);
            const profile = await profileService.updateProfile(user.id, body);
            return res.status(httpStatus.OK).json({
                profile
            })

        } catch (error) {
            logger.error("ERROR IN PROFILE CONTROLLER, Update Profile", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error"
            })
        }
    },
    updateUsername: async (req: Request, res: Response) => {
        try {
            const { body: { username } } = profileValidator.updateUsername.parse(req);
            const user = req.user;
            if (!user) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: "Unauthorized"
                })
            }
            logger.info("Update username ", user.username, ' TO ', username);

            const profile = await profileService.updateUsername(user.id, username);
            return res.status(httpStatus.OK).json({
                profile
            })

        } catch (error) {
            logger.error("ERROR IN PROFILE CONTROLLER, Update Username", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error"
            })
        }
    }
}