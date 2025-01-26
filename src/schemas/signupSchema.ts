import {z} from 'zod';

export const usernameValidation= z
    .string()
    .min(
        4, "Username must be atleast 4 characters long"
    )
    .max(
        20, "Username must be atmost 20 characters long"
    )
    .regex(
        /^[a-zA-Z0-9_]*$/, "Username must contain only letters, numbers and underscores"
    )

    export const signupSchema = z.object({
        username: usernameValidation,
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be atleast 8 characters long"),
    })