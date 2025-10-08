// controllers/auth.controller.ts (or wherever)
import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { loginDataSchema } from "../types/auth.types.js";
import * as authService from "../service/auth.service.js";
import { getCookieOptions } from "../utils/cookieOption.js"; 

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginDataSchema.parse(req.body);
  const { accessToken, refreshToken, role } = await authService.login({ email, password });

  const accessCookieOpts = {
    ...getCookieOptions(req),
    maxAge: (Number(process.env.JWT_ACCESS_EXPIRATION) || 15 * 60) * 1000,
  };

  const refreshCookieOpts = {
    ...getCookieOptions(req),
    maxAge: (Number(process.env.JWT_REFRESH_EXPIRATION) || 7 * 24 * 60 * 60) * 1000,
  };

  res.cookie("accessToken", accessToken, accessCookieOpts);
  res.cookie("refreshToken", refreshToken, refreshCookieOpts);

  return res.status(200).json(
    new ApiResponse("User Logged in successfully", { role }, true)
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // When clearing, use same options (path, sameSite, secure) so cookie matches and is removed
  const opts = { ...getCookieOptions(req), maxAge: 0 };

  res.clearCookie("accessToken", opts);
  res.clearCookie("refreshToken", opts);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = req.user;
  return res.status(200).json(new ApiResponse("User retrieved successfully", { user }, true));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json(new ApiResponse("Unauthorized request", null, false));
  }

  const { accessToken, role } = await authService.refreshAccessToken(token);

  const accessCookieOpts = {
    ...getCookieOptions(req),
    maxAge: (Number(process.env.JWT_ACCESS_EXPIRATION) || 15 * 60) * 1000,
  };

  res.cookie("accessToken", accessToken, accessCookieOpts);

  return res.status(200).json(new ApiResponse("Access token refreshed successfully", { role }, true));
});
