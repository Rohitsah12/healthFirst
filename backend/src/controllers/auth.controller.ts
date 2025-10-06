import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { loginDataSchema } from "../types/auth.types.js";
import * as authService from "../service/auth.service.js";
import { config } from "../config/index.js"



export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginDataSchema.parse(req.body);
    const { accessToken, refreshToken, role } = await authService.login({ email, password });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "strict",
        maxAge: config.jwtAccessExpiration ? parseInt(config.jwtAccessExpiration) * 1000 : 15 * 60 * 1000 // default 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "strict",
        maxAge: config.jwtRefreshExpiration ? parseInt(config.jwtRefreshExpiration) * 1000 : 7 * 24 * 60 * 60 * 1000 // default 7 days
    });

    return res.status(200).json(
        new ApiResponse(
            "User Logged in successfully",
            { role },
            true
        )
    );
})

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: config.nodeEnv == "production",
        sameSite: "strict"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config.nodeEnv == "production",
        sameSite: "strict"
    })

    res.json({
        success:true,
        message:"Logged out successfully"
    })
})

export const getMe = asyncHandler(async (req: any, res: Response) => {
    const user = req.user;
    return res.status(200).json(
        new ApiResponse(
            "User retrieved successfully",
            { user },
            true
        )
    );
})
