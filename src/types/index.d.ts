import { User as PrismaUser, UserProfile } from "@prisma/client";
import { Request } from "express";

declare global {
    namespace Express {
        interface User extends Partial<PrismaUser> {
            id: string
        }
        interface Request {
            user?: Partial<PrismaUser> & { id: string }
        }
    }
}