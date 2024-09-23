//Middleware to check authenticated users
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        logger.info("User is authenticated")
        next()
    } else { res.status(401).send("Unauthorized") }
}
export default checkAuthenticated;