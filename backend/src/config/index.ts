import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // backend app secret
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    region: process.env.AWS_REGION || '',

    // frontend url
    frontend_url : process.env.FRONTEND_URL || "http://localhost:3000",
  
    // jwt secret
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "SecretKey",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "SecretKeyx"
}
