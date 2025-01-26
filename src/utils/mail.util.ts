import nodemailer from 'nodemailer';
import { config } from '../config/config';
import logger from '../config/logger';
const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
    transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch(() =>
            logger.warn(
                'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
            )
        );
}



export const sendEmail = async (to: string, subject: string, text: string) => {
    logger.info(`Sending email to ${to}`);
    try {
        const msg = { from: config.email.from, to, subject, text };
        await transport.sendMail(msg);
        logger.info(`Email sent to ${to}`);
    } catch (error) {
        logger.error(`Error sending email to ${to}: ${error}`);
    }
};
