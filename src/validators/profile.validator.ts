import { z } from "zod";

export const profileValidator = {
    getPublicProfileSchema: z.object({
        params: z.object({
            username: z.string({ message: "Username is required" }).min(3, { message: "Username must be at least 3 characters long" }),
        })
    }),
}