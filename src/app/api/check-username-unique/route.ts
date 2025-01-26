import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signupSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        const {searchParams} = new URL(request.url);
        const username = searchParams.get("username");

        // Handle empty username
        if (!username) {
            return Response.json({
                success: false,
                message: "Username is required"
            }, { status: 400 });
        }

        // Remove any function serialization that might have been added
        const cleanUsername = username.split(',')[0];

        const result = UsernameQuerySchema.safeParse({
            username: cleanUsername
        });

        if (!result.success) {
            return Response.json({
                success: false,
                message: "Invalid username",
                errors: result.error.format().username?._errors
            }, { status: 400 });
        }

        const existingUser = await UserModel.findOne({
            username: cleanUsername,
            isVerified: true
        });

        if (existingUser) {
            return Response.json({
                success: false,
                message: "Username already taken"
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: "Username available"
        });

    } catch (error) {
        return Response.json({
            success: false, 
            message: "Server error"
        }, { status: 500 });
    }
}