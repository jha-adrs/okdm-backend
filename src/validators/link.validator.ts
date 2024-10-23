import { DisplayType, UserLinksType } from "@prisma/client"
import { z } from "zod"

const createLinkSchema = z.object({
    body: z.object({
        type: z.enum(
            Object.values(UserLinksType).map((type) => type) as any
            ,
            { message: "Invalid link type" }),
        text: z.string().optional(),
        link: z.string({ message: "Link is required" }).url({ message: "Links must be a valid URL" }),
        isVisible: z.boolean({ message: "Link Visibility is required" }),
        displayType: z.enum(
            Object.keys(DisplayType).map((type) => type) as any
        ).default(DisplayType.LINK).optional()
    }),
})

const updateLinkSchema = z.object({
    body: z.object({
        id: z.number().int().positive().optional(),
        type: z.enum(
            Object.values(UserLinksType).map((type) => type) as any
            ,
            { message: "Invalid link type" }).optional(),
        text: z.string().optional(),
        link: z.string({ message: "Link is required" }).url({ message: "Links must be a valid URL" }).optional(),
        isVisible: z.boolean({ message: "Link Visibility is required" }).optional(),
        displayType: z.enum(
            Object.keys(DisplayType).map((type) => type) as any
        ).optional()
    }),
})

const deleteLinkSchema = z.object({
    params: z.object({
        linkID: z.coerce.number().int().positive()
    }),
})

export const linkValidator = {
    createLink: createLinkSchema,
    updateLink: updateLinkSchema,
    deleteLink: deleteLinkSchema
}