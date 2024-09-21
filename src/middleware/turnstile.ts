//FOR Cloudflare turnstile
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import logger from "../config/logger";
import apiEndpoints from "../config/api";
import { config } from "../config/config";
import axios from "axios";

const captchaVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { captchaToken } = req.query;
        if (!captchaToken) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Needs captcha verification"
            })
        }
        logger.info("Verifying Captcha token")
        const cloudflareUrl = apiEndpoints.CAPTCHA.TURNSTILE_API;
        const cloudflareTurnstileSecret = config.cloudflare.turnstile.secretKey;
        const { data: cloudflareResponse } = await axios({
            method: "POST",
            url: cloudflareUrl,
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
            },
            data: `secret=${encodeURIComponent(cloudflareTurnstileSecret!)}&response=${encodeURIComponent(captchaToken as string)}`,
        });

        if (!cloudflareResponse.success) {
            return res.status(httpStatus.UNAUTHORIZED).send("Captcha verification failed");
        }
        logger.info("Cloudflare captcha verification successful");
        next();

    } catch (error) {
        logger.error("Error in captcha verification", error);
        return res.status(httpStatus.UNAUTHORIZED).send("Captcha verification failed");

    }
}

export default captchaVerification;