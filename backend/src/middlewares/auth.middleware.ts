import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import  asyncHandler  from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import  prisma  from '../config/prisma.config.js';
import { UserRole } from '@prisma/client';

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;

export const authenticateJWT = asyncHandler(async (req: any, _, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError( "Unauthorized request",401);
    }

    const decodedToken: any = jwt.verify(token, jwtAccessSecret!);
    const user = await prisma.user.findUnique({
      where: { id: decodedToken?.id },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      throw new ApiError("Invalid Access Token", 401);
    }

    req.user = user;
    return next();
});

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(
        `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.`,
        403
      );
    }
    next();
  };
};