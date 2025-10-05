
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

type AsyncHandlerFn = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncHandlerFn) =>
    (req: Request, res: Response, next: NextFunction): Promise<void> =>
        Promise.resolve(fn(req, res, next)).catch((error: any) => {
            let statusCode = res.statusCode !== 200 ? res.statusCode : 500
            let message = error.message || "Something went wrong";

            if (error instanceof ZodError) {
                statusCode = 400;
                message = error.issues.map(e => e.message);
            }


            if (error.code === "P2002") {
                statusCode = 409;
                if (error.meta?.target) {
                    message = `Duplicate entry: a record with the field  ${error.meta?.target?.join(", ")} already exists`;
                } else {
                    message = "Duplicate entry: a record with this field already exists"
                }
            }

            else if (error.code === "P2025") {
                statusCode = 404;
                if (error.meta?.modelName) {
                    message = `${error.meta.modelName} not found`;
                } else {
                    message = "Record not found";
                }
            }
            else if (error.code === "P2003") {
                statusCode = 400;

                const field = error.meta?.constraint;

                const column = field?.split("_")[1];

                if (column) {
                    message = `Invalid reference: The ${column} provided does not exist.`;
                } else {
                    message = "Invalid reference: one of the related records does not exist.";
                }
            }
            else if (error.code === "P1001") {
                statusCode = 503
                message = "Our database is currently unreachable. Please try again in a few minutes."
            }
            else if (error.code === "P1002") {
                statusCode = 503,
                    message = "Please refresh and try again"
            }

            res
                .status(statusCode)
                .json({ success: false, message: message instanceof Array ? message : [message] });
        })

export default asyncHandler;