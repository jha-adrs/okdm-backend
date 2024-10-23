// Controller for authentication

import { Request, Response } from "express"
import { userService } from "../services/user.service"
import { authValidator } from "../validators/auth.validator"
import { authService } from "../services/auth.service"
import { OTPType } from "@prisma/client"
import logger from "../config/logger"
import httpStatus from "http-status"
import { config } from "../config/config"
import { profileService } from "../services/profile.service"

const registerUser = async (req: Request, res: Response) => {
    try {
        // Logic for registering a user
        const { body: {
            name,
            email,
            username
        } } = await authValidator.registerUserSchema.parseAsync(req)
        const isUsernameTaken = await userService.isUsernameTaken(username)
        if (isUsernameTaken) {
            res.status(httpStatus.CONFLICT).send({
                message: "An account with this username already exists"
            })
            return
        }
        const isEmailTaken = await userService.isEmailTaken(email);
        if (isEmailTaken) {
            res.status(httpStatus.CONFLICT).send({
                message: "An account with this email already exists"
            })
            return
        }
        const user = await userService.registerUser(name, email, username);
        await authService.sendEmailOTP(email, user.id, OTPType.EMAIL_VERIFICATION);
        return res.status(httpStatus.CREATED).json({
            message: "OTP sent to email",
            data: user
        })
    } catch (error) {
        logger.error("ERROR IN REGISTER USER", error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error registering user")
    }
}

const verifyEmail = async (req: Request, res: Response) => {
    try {
        // Logic for verifying email
        const { body: {
            email,
            otp
        } } = await authValidator.verifyEmailSchema.parseAsync(req)
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" })
        }
        const isEmailVerified = await userService.isEmailVerified(email);
        if (isEmailVerified) {
            logger.info("Email is already verified")
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "Email is already verified"
            })
        }
        const otpRecord = await authService.verifyEmailOTP(email, otp, OTPType.EMAIL_VERIFICATION);
        if (!otpRecord) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: "Invalid OTP"
            })
        }
        const updatedUser = await userService.getUserByEmail(email);
        if (!updatedUser) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "User not found"
            })
        }
        // Log user in
        req.login(updatedUser, (err) => {
            if (err) {
                logger.info("Error logging in", err)
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Error logging in, please try again later"
                })
            }
            return res.status(httpStatus.OK).json({
                message: "Email verified",
                data: updatedUser
            })
        });
    } catch (error) {
        logger.error(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error logging in, please try again later"
        })
    }
}

const verifyPhone = async (req: Request, res: Response) => {
    try {
        // Logic for verifying phone
        const { body: {
            phone,
            otp
        } } = await authValidator.verifyPhoneSchema.parseAsync(req)
        const user = await userService.getUserByPhone(phone);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).send("User not found")
        }
        const isPhoneVerified = await userService.isPhoneVerified(phone);
        if (isPhoneVerified) {
            return res.status(httpStatus.NOT_ACCEPTABLE).send("Phone is already verified")
        }
        const otpRecord = await authService.verifyPhoneOTP(phone, otp);
        if (!otpRecord) {
            return res.status(httpStatus.UNAUTHORIZED).send("Invalid OTP")
        }
        // Log user in
        req.login(user, (err) => {
            if (err) {
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error logging in")
            }
            return res.status(httpStatus.OK).json({
                message: "Phone verified",
                data: user
            })
        });
    } catch (error) {
        logger.error(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error verifying phone")
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        // Logic for logging in a user
        const { body: {
            email,
            otp
        } } = await authValidator.loginSchema.parseAsync(req)
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).send("User not found")
        }
        const verifyOTPRes = await authService.verifyEmailOTP(email, otp, OTPType.EMAIL_LOGIN);
        if (!verifyOTPRes) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "Invalid OTP"
            })
        }
        // Log user in
        req.login(user, (err) => {
            if (err) {
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error logging in")
            }
            return res.status(httpStatus.OK).json({
                message: "Logged in",
                data: user
            })
        });

    } catch (error) {
        logger.error(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error logging in")
    }
}

const sendOTP = async (req: Request, res: Response) => {
    try {
        // Logic for sending OTP
        const { body: {
            type,
            value,
            verification
        } } = await authValidator.sendOTPSchema.parseAsync(req)
        if (type === "email") {
            const user = await userService.getUserByEmail(value);
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: "User not found"
                })
            }
            if (verification === "register") {
                const isVerified = await userService.isEmailVerified(value);
                if (isVerified) {
                    return res.status(httpStatus.CONFLICT).json({
                        message: "Email is already verified"
                    })
                }
                await authService.sendEmailOTP(value, user.id, OTPType.EMAIL_VERIFICATION);
            } else {
                await authService.sendEmailOTP(value, user.id, OTPType.EMAIL_LOGIN);
            }
            return res.status(httpStatus.OK).json({
                message: "OTP sent to email",
                data: user
            })
        } else {
            // Not implementing Phone Auth right now
            return res.status(httpStatus.BAD_REQUEST).send("Phone auth not supported yet")
        }
    } catch (error) {
        logger.error(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error sending OTP")
    }
}

const logoutUser = async (req: Request, res: Response) => {
    try {
        logger.info("Logging out user", req.user?.id)
        req.logOut((err) => {
            if (err) {
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error logging out")
            }
            return res.redirect(config.clientUrl)
        })

    } catch (error) {
        logger.error(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error logging out")
    }
}

const isUsernameTaken = async (req: Request, res: Response) => {
    try {
        const { query: {
            username
        } } = req
        if (!username || typeof username !== "string") {
            return res.status(httpStatus.BAD_REQUEST).send("Username is required")
        }
        const isUsernameTaken = await userService.isUsernameTaken(username as string)
        return res.status(httpStatus.OK).json({
            data: isUsernameTaken
        })
    } catch (error) {
        logger.error(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error checking username")
    }
}

const loginSuccess = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            logger.info("User not logged in")
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: "User not logged in"
            })
        }
        logger.info("User logged in", req.user)
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "User not found"
            })
        }
        const profile = await profileService.getMyProfile(user.id);
        return res.status(httpStatus.OK).json({
            message: "Logged in",
            data: user,
            profile
        })
    } catch (error) {
        logger.error("Error in login/success", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error in login/success")
    }
}

const verifyToken = async (req: Request, res: Response) => {
    try {
        if (req.isAuthenticated()) {
            return res.status(httpStatus.OK).json({
                message: "Token is valid",
                data: req.user
            })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: "Token is invalid"
            })
        }
    } catch (error) {
        logger.error("Error in verifyToken", error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Error verifying token")
    }
}

export const authController = {
    registerUser,
    verifyEmail,
    loginUser,
    verifyPhone,
    sendOTP,
    logoutUser,
    isUsernameTaken,
    loginSuccess,
    verifyToken
}