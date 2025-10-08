// utils/cookieOptions.ts
import type { Request } from "express";
import { config } from "../config/index.js";

export const getCookieOptions = (req: Request) => {
  // Detect if the request is secure (behind proxy like nginx or load balancer, check x-forwarded-proto)
  const forwardedProto = (req.headers["x-forwarded-proto"] as string) || "";
  const isSecureRequest = req.secure || forwardedProto === "https";

  // Use secure cookies only if in production AND the request is secure (HTTPS).
  const secure = config.nodeEnv === "production" && isSecureRequest;

  // For cross-site cookies (frontend different origin): you'd need SameSite: "none" AND secure:true (HTTPS).
  // Since you are using http://publicIp currently, use "lax" and secure=false so browser will accept cookies.
  const sameSite = secure ? "none" : "lax";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/", // make sure same path is used when clearing
    maxAge: config.jwtAccessExpiration ? parseInt(config.jwtAccessExpiration) * 1000 : 15 * 60 * 1000,
  } as const;
};
