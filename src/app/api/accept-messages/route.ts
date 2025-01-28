import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import type { User } from "next-auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const { acceptMessages } = await request.json();
        if (typeof acceptMessages !== 'boolean') {
            return Response.json({
                success: false,
                message: "Invalid request body"
            }, { status: 400 });
        }

        const userId = new ObjectId(session.user._id);
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: `Messages ${acceptMessages ? 'enabled' : 'disabled'} successfully`,
            isAcceptingMessage: updatedUser.isAcceptingMessage
        });

    } catch (error) {
        console.error("Error updating message acceptance:", error);
        return Response.json({
            success: false,
            message: "Server error updating message preferences"
        }, { status: 500 });
    }
}


export async function GET (_request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user : User = session?.user as User

    if(!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized"
        }, {
            status: 401
        })
    }

    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            })
        }
        return Response.json({
            success: true,
            acceptMessages: user.isAcceptingMessage
        })

    } catch (error) {
        console.log("Error accepting messages", error)
        return Response.json({
            success: false,
            message: "Error accepting messages"
        }, {
            status: 500
        }
    )
}
    }