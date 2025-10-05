import * as z from "zod";

const emailSchema = z.string().email("Invalid email address");


const passwordSchema = z.string().min(6, "Password must be at least 6 characters long").max(100,"Password must be at most 100 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$%*?&])[A-Za-z0-9@$%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");

export const loginDataSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

export type LoginDataInput = z.infer<typeof loginDataSchema>;