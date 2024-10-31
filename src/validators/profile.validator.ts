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
                //Should be a valid hex color
                return /^#[0-9A-F]{6}$/i.test(data.value)
            }
            return true;
        }, { message: "Invalid data" })
    })
}