// User service

import { Profile } from "passport-google-oauth20"
import prisma from "../config/db"
import { AuthProvider, TokenType } from "@prisma/client";
import { generateFakeUsername } from "../utils/faker";
import logger from "../config/logger";

const getOrCreateGoogleUser = async (accessToken: string, refreshToken: string, profile: Profile) => {
    const tokenType = TokenType.ACCESS;
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
                UserProfile: {
                    connectOrCreate: {
                        where: {
                            userId: user!.id
                        },
                        create: {
                            avatar: profile.photos![0].value,
                        }
                    }
                }
            },
            include: {
                UserProfile: true
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
            avatar: newUser.UserProfile?.avatar,
            type: tokenType
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
        avatar: user.UserProfile?.avatar,
        type: tokenType
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

export const userService = {
    getOrCreateGoogleUser,
    getUserById
}
