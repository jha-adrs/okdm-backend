// Passport configuration
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local';
import { AuthProvider, OTPType } from '@prisma/client';
import { config } from './config';
import prisma from './db';
import passport from 'passport';
import { userService } from '../services/user.service';
import logger from './logger';

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtVerify: VerifyCallback = async (payload, done) => {
    try {
        
        const user = await prisma.user.findUnique({
            where: {
                id: payload.sub
            },
            select: {
                id: true,
                username: true,
                isDeleted: true,
                isPhoneVerified: true,
                isEmailVerified: true,
            }
        });
        if (!user) {
            return done(null, false);
        }
        // TODO: Re think access levels
        if (user.isDeleted) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}
export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);


const googleOptions = {
    clientID: config.oauth.google.clientId,
    clientSecret: config.oauth.google.clientSecret,
    callbackURL: config.oauth.google.callbackURL,
    scope: ['profile', 'email']
}

export const googleStrategy = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await userService.getOrCreateGoogleUser(accessToken, refreshToken, profile);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
});

// Uses Email + Email OTP
export const localStrategy = new LocalStrategy(async (username, password, done) => {
    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return done(null, false);
        }
        if (user.provider !== AuthProvider.LOCAL) {
            return done(null, false);
        }
        if (user.isDeleted) {
            return done(null, false);
        }
        if (!user.isEmailVerified) {
            return done(null, false);
        }
        const isValid = await userService.verifyOTP(password, user.id, OTPType.EMAIL_LOGIN);
        if (!isValid) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
})


passport.use(jwtStrategy);
passport.use(googleStrategy);
passport.serializeUser((user, next) => {
    next(null, user);
})
passport.deserializeUser(async (user: any, next) => {
    // Find user by id
    logger.info("Deserializing user", user);
    if (!user || !user.id) {
        return next(null, false);
    }
    const dbUser = await userService.getUserById(user.id);
    logger.info("Deserialized user", dbUser);
    if (!dbUser) {
        return next(null, false);
    }

    if (dbUser.isDeleted) {
        return next(null, false);
    }

    next(null, user);
})