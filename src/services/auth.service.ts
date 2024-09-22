import randomstring from 'randomstring'
import prisma from '../config/db'
import { OTPType } from '@prisma/client'

const generateOTP = () => {
    return randomstring.generate({
        length: 6,
        charset: 'numeric'
    })
}
/**
 * Check otp already exists in the database
 * If exists, delete the old one and create a new one
 * 
 */
const sendEmailOTP = async (email: string, userID: string, type: OTPType) => {
    const existingOTP = await prisma.otp.findFirst({
        where: {
            userId: userID,
            type
        }
    });
    if (existingOTP) {
        await prisma.otp.delete({
            where: {
                id: existingOTP.id
            }
        });
    }
    const otp = generateOTP();
    await prisma.otp.create({
        data: {
            otp,
            type,
            userId: userID,
            expires: new Date(Date.now() + 1000 * 60 * 20) // 5 minutes
        }
    });

    return otp;

}

const sendPhoneOTP = async (phone: string, otp: string) => {
    const existingOTP = await prisma.otp.findFirst({
        where: {
            User: {
                phone
            },
            type: OTPType.PHONE_VERIFICATION
        }
    });
    if (existingOTP) {
        await prisma.otp.delete({
            where: {
                id: existingOTP.id
            }
        });
    }
    await prisma.otp.create({
        data: {
            otp,
            type: OTPType.PHONE_VERIFICATION,
            User: {
                connect: {
                    phone
                }
            },
            expires: new Date(Date.now() + 1000 * 60 * 5) // 5 minutes
        }
    });
    return otp;
}

const verifyEmailOTP = async (email: string, otp: string, type: OTPType) => {
    const otpRecord = await prisma.otp.findFirst({
        where: {
            otp,
            type,
            User: {
                email
            },
            expires: {
                gt: new Date()
            }
        }
    });
    if (otpRecord) {
        await prisma.otp.delete({
            where: {
                id: otpRecord.id
            }
        });
        // Set email as verified
        await prisma.user.update({
            where: {
                email
            },
            data: {
                isEmailVerified: true
            }
        });
        return true;
    } else {
        return false;
    }
}

const verifyPhoneOTP = async (phone: string, otp: string) => {
    const otpRecord = await prisma.otp.findFirst({
        where: {
            otp,
            User: {
                phone
            },
            expires: {
                gt: new Date()
            },
            type: OTPType.PHONE_VERIFICATION
        }
    });
    if (otpRecord) {
        await prisma.otp.delete({
            where: {
                id: otpRecord.id
            }
        });
        // Set phone as verified
        await prisma.user.update({
            where: {
                phone
            },
            data: {
                isPhoneVerified: true
            }
        });
        return true;
    } else {
        return false;
    }
}


export const authService = {
    sendEmailOTP,
    sendPhoneOTP,
    verifyEmailOTP,
    verifyPhoneOTP
}