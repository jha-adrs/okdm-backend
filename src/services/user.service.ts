// User service

import { Profile } from "passport-google-oauth20"
import prisma from "../config/db"
import { AuthProvider, OTPType } from "@prisma/client";
import { generateFakeUsername } from "../utils/faker.util";
import logger from "../config/logger";

const getOrCreateGoogleUser = async (accessToken: string, refreshToken: string, profile: Profile) => {

    logger.info("Getting or creating user from google profile", profile);
    const user = await prisma.user.findUnique({
        where: {
            email: profile.emails![0].value
        },
        select: {
            id: true,
            username: true,
            isDeleted: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            email: true,
            provider: true,
            UserProfile: {
                select: {
                    avatar: true
                }
            }
        }
    });
    //Create user if not exists
    if (!user) {
        logger.info("Creating new user from google profile", profile);
        const newUser = await prisma.user.create({
            data: {
                email: profile.emails![0].value,
                username: generateFakeUsername(profile.displayName!),
                isEmailVerified: true,
                name: profile.displayName!,
                provider: AuthProvider.GOOGLE,
                googleId: profile.id,
            }
        });
        const newProfile = await prisma.userProfile.create({
            data: {
                avatar: profile.photos![0].value,
                userId: newUser.id
            }
        });

        return {
            id: newUser.id,
            username: newUser.username,
            isDeleted: newUser.isDeleted,
            isPhoneVerified: newUser.isPhoneVerified,
            isEmailVerified: newUser.isEmailVerified,
            email: newUser.email,
            provider: newUser.provider,
            avatar: newProfile.avatar
        }
    }
    if (user && user.provider !== AuthProvider.GOOGLE) {
        throw new Error('User already exists with this email');
    }
    return {
        id: user.id,
        username: user.username,
        isDeleted: user.isDeleted,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        email: user.email,
        provider: user.provider,
        avatar: user.UserProfile?.avatar
    };
}

const getUserById = async (id: string) => {
    logger.info("Getting user by id", id);
    const dbUser = await prisma.user.findUnique({
        where: {
            id: id
        },
        select: {
            id: true,
            username: true,
            isDeleted: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            email: true,
            UserProfile: {
                select: {
                    avatar: true
                }
            }
        }
    });
    return dbUser;
}

const getUserByUsername = async (username: string) => {
    logger.info("Getting user by username", username);
    const dbUser = await prisma.user.findUnique({
        where: {
            username: username
        },
        select: {
            id: true,
            username: true,
            isDeleted: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            email: true,
            provider: true,
            UserProfile: {
                select: {
                    avatar: true
                }
            }
        }
    });
    return dbUser;
}

// For verifying OTP loggin purposes
const verifyOTP = async (otp: string, userId: string, type: OTPType) => {
    //Takes OTP and user id and verifies the OTP
    logger.info("Verifying OTP", otp, userId, type);
    const otpRecord = await prisma.otp.findFirst({
        where: {
            userId: userId,
            type: type
        }
    });
    if (!otpRecord) {
        return false;
    }
    if (otpRecord.otp !== otp) {
        return false;
    }
    // Set OTP as used and user as verified
    await prisma.otp.update({
        where: {
            id: otpRecord.id
        },
        data: {
            isUsed: true
        }
    });

    return true;
}

async function verifyPhone(phone: string, otp: string) {

}

export const userService = {
    getOrCreateGoogleUser,
    getUserById,
    getUserByUsername,
    verifyOTP,
    verifyPhone
}
