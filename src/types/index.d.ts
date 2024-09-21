import { User } from "@prisma/client";
import { Request } from "express";
declare global {
    namespace Express {
        interface User extends User { }
        interface Request {
            user?: User;
        }
    }
}