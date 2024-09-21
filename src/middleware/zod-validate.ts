import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import pick from "../utils/pick";
import httpStatus from "http-status";

const validate = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    if (!validSchema.success) {
        const errorMessage = validSchema.error.errors.map((error) => error.message).join(", ");
        return res.status(
            httpStatus.BAD_REQUEST
        ).json({ message: errorMessage });
    }
    Object.assign(req, pick(validSchema.data, ["body", "query", "params"]));
    return next();
}

export default validate;