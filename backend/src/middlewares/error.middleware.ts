import type { NextFunction, Request, Response } from "express";
import { config } from "../config/index.js";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError
} from "@prisma/client/runtime/library";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = "Something went wrong"; 
  let errors: string[] = [];

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint failed
        statusCode = 409;
        message = "Duplicate field value entered";
        break;

      case "P2003": // Foreign key constraint failed
        statusCode = 400;
        message = "Invalid reference to related record";
        break;

      case "P2025": // Record not found
        statusCode = 404;
        message = "Requested resource not found";
        break;

      default:
        statusCode = 400;
        message = "Database request error";
    }
  } else if (err instanceof PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  } else if (err instanceof PrismaClientInitializationError) {
    statusCode = 500;
    message = "Database connection error";
  } else if (err instanceof PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Unexpected database error";
  } else {
    if (config.nodeEnv !== "PRODUCTION") {
      message = err?.message || message;
      errors.push(err?.message);
    }
  }

  if (err.errors && Array.isArray(err.errors)) {
    errors = errors.concat(err.errors);
  }
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    timeStamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};