import { z } from "zod"

const registerUserSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required" }).email({ message: "Please enter a valid email" }).trim(),
        name: z.string({ message: "Name is required" }).min(3, { message: "Name must be at least 3 characters long" }).trim(),
        username: z.string({ message: "Username is required" }).min(3, { message: "Username must be at least 3 characters long" }).trim(),
    })
})

const verifyEmailSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required" }).email({ message: "Please enter a valid email" }).trim(),
        otp: z.string({ message: "OTP is required" }).length(6, { message: "OTP must be 6 characters long" }).trim()
    })
})

const verifyPhoneSchema = z.object({
    body: z.object({
        phone: z.string({ message: "Phone is required" }).length(10, { message: "Phone must be 10 characters long" }).trim(),
        otp: z.string({ message: "OTP is required" }).length(6, { message: "OTP must be 6 characters long" }).trim()
    })
})

const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required" }).email({ message: "Please enter a valid email" }).trim(),
        otp: z.string({ message: "OTP is required" }).length(6, { message: "OTP must be 6 characters long" }).trim()
    })
})

const sendOTPSchema = z.object({
    body: z.object({
        type: z.enum(["email", "phone"], { message: "Invalid type" }),
        value: z.string({ message: "Email or Phone is required" }).email().or(z.string().length(10).trim())
    })
})

export const authValidator = {
    registerUserSchema,
    verifyEmailSchema,
    loginSchema,
    verifyPhoneSchema,
    sendOTPSchema
}