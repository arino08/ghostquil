import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerifcationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerification(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'GhostQuil | Verificaton Code ',
            react: VerificationEmail({username, otp: verifyCode}),
          });
        return {success: true, message: "Verification email sent"};

    } catch (emailError) {
        console.error("Error sending email: ", emailError);
        return {success: false, message: "Error sending email"};
    }
}