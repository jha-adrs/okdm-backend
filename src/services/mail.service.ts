import nodemailer from 'nodemailer';
import { config } from '../config/config';
import logger from '../config/logger';
import { sendEmail } from '../utils/mail.util';
// TODO: Log Emails if needed
const sendResetPasswordEmail = async (to: string, token: string) => {
    const subject = 'Reset password';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
    const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
    await sendEmail(to, subject, text);
};

const sendVerificationEmail = async (to: string, token: string) => {
    const subject = 'Email Verification';
    // replace this url with the link to the email verification page of your front-end app
    const verificationEmailUrl = `${config.serverUrl}/v1/auth/verify-email?token=${token}`;
    const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}`;
    await sendEmail(to, subject, text);
};

export default {
    sendEmail,
    sendResetPasswordEmail,
    sendVerificationEmail
};
