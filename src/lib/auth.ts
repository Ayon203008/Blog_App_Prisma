import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "paypal572874@gmail.com",
        pass: "batd daxg lfor phai",
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp:true, // * only in the register time email will be send
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            console.log({ user, url, token })
            // * must make this in under try catch block {}
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
                const info = await transporter.sendMail({
                    from: '"Abid Hasan Ayon" <paypal572874@gmail.com>',
                    to: user.email, // ! for dynamic email ***
                    subject: "Hello ✔",
                    text: "Hello world?", // ! generate a html template and give it there 
                    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:#2563eb; padding:20px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px;">
                Verify Your Email
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <p style="font-size:16px; margin-bottom:16px;">
                Hello 👋,
              </p>

              <p style="font-size:16px; line-height:1.6;">
                Thank you for creating an account. Please verify your email address by clicking the button below.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a href="${verificationUrl}"
                  style="background:#2563eb; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; font-size:16px; display:inline-block;">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; color:#555555;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="font-size:14px; word-break:break-all; color:#2563eb;">
                ${verificationUrl}
              </p>

              <p style="font-size:14px; color:#777777; margin-top:30px;">
                If you did not create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9; padding:16px; text-align:center; font-size:12px; color:#6b7280;">
              © ${new Date().getFullYear()} Your Company Name. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`, // HTML version of the message
                });
            }
            catch (error) {
                console.log(error)
            }
        }
    },
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
            prompt:"select_account consent", // * add this to your code
            accessType:"offline"

        }, 
    },
});