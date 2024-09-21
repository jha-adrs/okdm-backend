//Middleware to check authenticated users
import { Request, Response, NextFunction } from 'express';

const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    req.isAuthenticated() ? next() : res.status(401).send("Unauthorized")
}
export default checkAuthenticated;