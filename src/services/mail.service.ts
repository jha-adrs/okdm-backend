import { sendEmail } from '../utils/mail.util';


const sendVerificationEmail = async (to: string, OTP: string) => {
    const subject = 'Email Verification';
    // replace this url with the link to the email verification page of your front-end app
    const text = `Dear user,
To verify your email, use this OTP: ${OTP}
If you did not request any OTP, then ignore this email.`;

    await sendEmail(to, subject, text);
};

export default {
    sendEmail,
    sendVerificationEmail
};
