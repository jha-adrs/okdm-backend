//Rate limiter for authentication routes

import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { config } from "../config/config";
const authRateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (config.env === "production") {
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: "Too many requests from this IP, please try again after 15 minutes",
        });
        limiter(req, res, next);
    } else {
        next();
    }
}

const otherRouteRateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (config.env === "production") {
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 200, // limit each IP to 100 requests per windowMs
            message: "Too many requests from this IP, please try again after 15 minutes",
        });
        limiter(req, res, next);
    } else {
        next();
    }
}

export default  {
    authRateLimiterMiddleware,
    otherRouteRateLimiterMiddleware
}