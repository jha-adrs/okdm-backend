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
    }
}