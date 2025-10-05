import "dotenv/config"
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "../config/index.js";


const ACCESS_SECRET =config.jwtAccessSecret;
const REFRESH_SECRET = config.jwtRefreshSecret;


export const generateTokens = async (
    id: string,
    role: string,
): Promise<{ accessToken: string, refreshToken: string }> => {
    const accessToken = generateAccessToken(id, role)
    const refreshToken = await generateRefreshToken(id, role)
    return { accessToken, refreshToken }
};


export const generateAccessToken = (
    id: string,
    role: string
): string => {
    const accessToken = jwt.sign(
        { id, role },
        ACCESS_SECRET as unknown as string,
        {
            expiresIn: config.jwtAccessExpiration ? parseInt(config.jwtAccessExpiration) : "15m",
        }
    );

    return accessToken
};

export const generateRefreshToken = async (
    id: string,
    role: string,
): Promise<string> => {

    const refreshToken = jwt.sign(
        { id, role },
        REFRESH_SECRET!,
        {
            expiresIn: config.jwtRefreshExpiration ? parseInt(config.jwtRefreshExpiration) : "7d",
        }
    );

    return refreshToken;

};