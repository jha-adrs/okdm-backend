// User service

import { Profile } from "passport-google-oauth20"
import prisma from "../config/db"
import { AuthProvider, OTPType } from "@prisma/client";
import { generateFakeUsername } from "../utils/faker.util";
import logger from "../config/logger";

const isUsernameTaken = async (username: string) => {
    const user = await prisma.user.findFirst({
        where: {
            username: username
        },
        select: {
            username: true
        }
    });
    return !!user;
}

const isEmailTaken = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email: email
        },
        select: {
            email: true
        }
    });
    return !!user;
}

const isEmailVerified = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email: email
        },
        select: {
            isEmailVerified: true
        }
    });
    return user?.isEmailVerified;
}

const isPhoneTaken = async (phone: string) => {
    const user = await prisma.user.findFirst({
        where: {
            phone: phone
        },
        select: {
            phone: true
        }
    });
    return !!user;
}

const isPhoneVerified = async (phone: string) => {
    const user = await prisma.user.findFirst({
        where: {
            phone: phone
        },
        select: {
            isPhoneVerified: true
        }
    });
    return user?.isPhoneVerified;
}

const registerUser = async (name: string, email: string, username: string) => {
    // Register a new user
    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
            username: username,
            provider: AuthProvider.LOCAL
        }
    });
    // Create a new profile for the user
    const profile = await prisma.userProfile.create({
        data: {
            userId: user.id
        }
    });
    return user;
}

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
            image: true,
        }
    });
    //Create user if not exists
    if (!user) {
        logger.info("Creating new user from google profile", profile);
        const newUser = await prisma.user.create({
            data: {
                email: profile.emails![0].value,
                username: await generateFakeUsername(profile.emails![0].value),
                isEmailVerified: true,
                name: profile.displayName!,
                provider: AuthProvider.GOOGLE,
                googleId: profile.id,
                image: profile.photos![0].value
            }
        });
        const newProfile = await prisma.userProfile.create({
            data: {
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
            avatar: newUser.image
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
        avatar: user.image
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
            image: true,
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
            image: true,
        }
    });
    return dbUser;
}

const getUserByEmail = async (email: string) => {
    logger.info("Getting user by email", email);
    const dbUser = await prisma.user.findUnique({
        where: {
            email: email
        },
        select: {
            id: true,
            username: true,
            isDeleted: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            email: true,
            provider: true,
            image: true,
        }
    });
    return dbUser;
}

const getUserByPhone = async (phone: string) => {
    logger.info("Getting user by phone", phone);
    const dbUser = await prisma.user.findUnique({
        where: {
            phone: phone
        },
        select: {
            id: true,
            username: true,
            isDeleted: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            phone: true,
            phoneExtension: true,
            email: true,
            provider: true,
            image: true,
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
    isUsernameTaken,
    isEmailTaken,
    isPhoneTaken,
    registerUser,
    getOrCreateGoogleUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    verifyOTP,
    verifyPhone,
    isEmailVerified,
    isPhoneVerified,
    getUserByPhone,
}
