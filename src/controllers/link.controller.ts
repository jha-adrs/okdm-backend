import { Request, Response } from "express";
import { linkService } from "../services/link.service";
import httpStatus from "http-status";
import { linkValidator } from "../validators/link.validator";
import prisma from "../config/db";
import logger from "../config/logger";

export const linkController = {
    async createLink(req: Request, res: Response) {
        try {
            // Create a new link
            logger.info("Creating a new link for user: ", req.user?.id);
            const {
                body
            } = linkValidator.createLink.parse(req);
            const userID = req.user?.id;
            if (!userID) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const newLink = await linkService.createLink(userID, { body })
            return res.status(httpStatus.CREATED).json({
                link: newLink,
                success: true
            });
        } catch (error) {
            logger.error("Error creating link: ", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error"
            });
        }
    },
    async rearrangeLinks(req: Request, res: Response) {
        // Rearrange links
    },
    async getLinks(req: Request, res: Response) {
        try {
            // Get all links
            const userID = req.user?.id;
            if (!userID) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const links = await linkService.getLinks(userID, true);
            return res.status(httpStatus.OK).json({
                links,
                success: true,
                count: links.length,
            });
        } catch (error) {
            logger.error("Error getting links: ", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error"
            });
        }
    },
    async updateLink(req: Request, res: Response) {
        try {
            // Update a new link
            logger.info("Creating a new link for user: ", req.user?.id);
            const {
                body
            } = linkValidator.updateLink.parse(req);
            const userID = req.user?.id;
            if (!userID) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const newLink = await linkService.updateLink(userID, { body })
            return res.status(httpStatus.CREATED).json({
                link: newLink,
                success: true
            });
        } catch (error) {
            logger.error("Error creating link: ", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error"
            });
        }
    },
    async deleteLink(req: Request, res: Response) {
        // Delete a link
        try {
            const userID = req.user?.id;
            if (!userID) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const {
                params: { linkID }
            } = linkValidator.deleteLink.parse(req);
            logger.info("Deleting link: ", linkID);
            await linkService.deleteLink(userID, linkID);
            return res.status(httpStatus.OK).json({
                message: "Link deleted successfully",
                success: true
            });

        } catch (error) {
            logger.error("Error deleting link: ", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error"
            });
        }
    },

}