import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcryptjs"
import { generateTokens } from "../utils/auth.js";
import  prisma  from "../config/prisma.config.js";

import type { LoginDataInput } from "../types/auth.types.js";

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