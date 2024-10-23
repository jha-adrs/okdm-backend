import { UserLinks } from "@prisma/client";
import prisma from "../config/db"
import { z } from "zod";
import { linkValidator } from "../validators/link.validator";

export const linkService = {
    getLinks: async (userID: string, getHidden: boolean) => {
        const links = await prisma.userLinks.findMany({
            where: {
                userId: userID,
                isVisible: getHidden ? undefined : true
            },
            orderBy: {
                index: "asc"
            }
        });
        return links;
    },
    createLink: async (userID: string, data: z.infer<typeof linkValidator.createLink>) => {
        const link = data.body;
        const newLink = await prisma.userLinks.create({
            data: {
                userId: userID,
                type: link.type,
                text: link.text || link.link,
                link: link.link,
                isVisible: link.isVisible,
                displayType: link.displayType
            }
        });
        return newLink;
    },
    updateLink: async (userID: string, data: z.infer<typeof linkValidator.updateLink>) => {
        const link = data.body;
        if (!link.id || typeof link.id !== "number") {
            throw new Error("Link ID is required");
        }
        const updatedLink = await prisma.userLinks.update({
            where: {
                id: link.id,
                userId: userID,
            },
            data: {
                type: link.type,
                text: link.text || link.link,
                link: link.link,
                isVisible: link.isVisible,
                displayType: link.displayType
            }
        });
        return updatedLink;
    },
    deleteLink: async (userID: string, linkID: number) => {

        if (!linkID || typeof linkID !== "number" || !userID) {
            throw new Error("Link ID is required");
        }
        const deletedLink = await prisma.userLinks.delete({
            where: {
                id: linkID,
                userId: userID
            }
        });
        return deletedLink;
    }
}