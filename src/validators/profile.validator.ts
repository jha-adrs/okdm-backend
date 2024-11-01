import { UserDesignation } from "@prisma/client";
import { z } from "zod";

export const profileValidator = {
    getPublicProfileSchema: z.object({
        params: z.object({
            username: z.string({ message: "Username is required" }).min(3, { message: "Username must be at least 3 characters long" }),
        })
    }),
    updateBackgroundSchema: z.object({
        body: z.object({
            type: z.enum(["IMAGE", "COLOR"]),
            value: z.string()
        }).refine(data => {
            if (data.type === "IMAGE") {
                return data.value.startsWith("http") || data.value.startsWith("https")
            }
            else if (data.type === "COLOR") {
                //Should be a valid hex color or comma separated multiple colors
                //#00416A,#799F0C,#FFE000
                return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(data.value) || /^#(?:[0-9a-fA-F]{3}){1,2}(?:, ?#(?:[0-9a-fA-F]{3}){1,2})*$/.test(data.value)

            }
            return true;
        }, { message: "Invalid data" })
    }),
    updateProfile: z.object({
        body: z.object({
            isPublic: z.boolean().optional(),
            bio: z.string().optional(),
            location: z.string().optional(),
            website: z.string().optional(),
            designation: z.nativeEnum(UserDesignation).optional(),
            designation_location: z.string().optional(),
            username: z.string().optional(),
        })
    }),
    updateUsername: z.object({
        body: z.object({
            username: z.string({ message: "Username is required" }).min(3, { message: "Username must be at least 3 characters long" }).max(50, { message: "Username must be at most 50 characters long" }),
        })
    }),
}