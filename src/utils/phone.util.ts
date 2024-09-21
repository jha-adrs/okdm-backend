//Handles sending OTP to phone numbers and whatsapp

import APIS from "../config/api"

import axios from "axios";
import { config } from "../config/config";
import logger from "../config/logger";

export const sendSMSOTP = async (phone: string, otp: string) => {
    //Sends OTP to the phone number
    const URL = APIS.SMS.FAST2SMS;

    try {
        const { data } = await axios({
            method: 'POST',
            url: URL,
            headers: {
                'Content-Type': 'application/json',
                'authorization': config.api_keys.fast2sms
            },
            data: {
                "route": "otp",
                "variables_values": otp,
                "numbers": phone,
            }
        });
        if (data.return === true) {
            logger.info(`OTP sent to`, phone, "request_id", data.request_id);
            return true;
        }
        logger.error(`Error sending OTP to ${phone}`);
        return false;

    } catch (error) {
        logger.error(`Error sending OTP to ${phone}`, error);
        return false;
    }
}