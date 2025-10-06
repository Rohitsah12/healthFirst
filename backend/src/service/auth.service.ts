import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { generateAccessToken, generateTokens } from "../utils/auth.js";
import  prisma  from "../config/prisma.config.js";

import type { LoginDataInput } from "../types/auth.types.js";
import { config } from "../config/index.js";

export const login = async ({ email, password }: LoginDataInput) => {

    const user = await prisma?.user.findFirst({
        where: { email: email.toLowerCase() },
    });

    if (!user) throw new ApiError("User does not exist", 404);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new ApiError("Invalid credentials", 401)

    const tokens = await generateTokens(user.id, user.role)
    return { ...tokens, role: user.role }
}

export const refreshAccessToken = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret as string) as JwtPayload;

        if (!decoded.id || !decoded.role) {
            throw new ApiError("Invalid token", 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            throw new ApiError("User not found", 401);
        }

        const accessToken = generateAccessToken(user.id, user.role);

        return { accessToken, role: user.role };

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError("Invalid or expired token", 401);
        }
        throw error;
    }
};