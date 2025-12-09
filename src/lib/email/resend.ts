import { appConfig } from "@/config/app";
import { env } from "@/env";
import { Resend } from "resend";

export const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
	to: string | string[];
	subject: string;
	html: string;
	from?: string;
}

export async function sendEmail({
	to,
	subject,
	html,
	from = "Example Sender <noreply@example.com>",
}: SendEmailOptions) {
	console.log("[Email] Attempting to send email:", {
		to,
		subject,
		from,
	});

	try {
		const { data, error } = await resend.emails.send({
			from,
			to,
			subject,
			html,
		});

		if (error) {
			console.error("[Email] Resend API error:", error);
			throw error;
		}

		console.log("[Email] Successfully sent email:", data);
		return data;
	} catch (error) {
		console.error("[Email] Error sending email:", error);
		throw error;
	}
}

export function generateResetPasswordEmail(
	resetLink: string,
	userName?: string,
) {
	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 32px;
            margin-top: 20px;
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo img {
            height: 40px;
            width: auto;
        }
        h1 {
            color: #111827;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        p {
            color: #6b7280;
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 24px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 32px;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            text-align: center;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 0;
        }
        .link {
            color: #4f46e5;
            text-decoration: underline;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <h1 style="color: #4f46e5; font-size: 28px;">${appConfig.name}</h1>
            </div>

            <h1>Reset Your Password</h1>

            <p>
                ${userName ? `Hi ${userName},` : "Hi there,"}
            </p>

            <p>
                We received a request to reset your password for your ${appConfig.name} account. Click the button below to create a new password:
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>

            <p style="font-size: 14px; color: #9ca3af;">
                Or copy and paste this link into your browser:
                <br>
                <a href="${resetLink}" class="link">${resetLink}</a>
            </p>

            <div class="footer">
                <p>
                    This link will expire in 1 hour for security reasons.
                </p>
                <p>
                    If you didn't request a password reset, you can safely ignore this email.
                </p>
                <p style="margin-top: 16px;">
                    — The ${appConfig.name} Team
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;
}

export function generateVerificationEmail(
	verificationLink: string,
	userName?: string,
) {
	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 32px;
            margin-top: 20px;
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        h1 {
            color: #111827;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        p {
            color: #6b7280;
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 24px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 32px;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            text-align: center;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 0;
        }
        .link {
            color: #4f46e5;
            text-decoration: underline;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <h1 style="color: #4f46e5; font-size: 28px;">${appConfig.name}</h1>
            </div>

            <h1>Verify Your Email Address</h1>

            <p>
                ${userName ? `Welcome to ${appConfig.name}, ${userName}!` : `Welcome to ${appConfig.name}!`}
            </p>

            <p>
                Please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationLink}" class="button">Verify Email</a>
            </div>

            <p style="font-size: 14px; color: #9ca3af;">
                Or copy and paste this link into your browser:
                <br>
                <a href="${verificationLink}" class="link">${verificationLink}</a>
            </p>

            <div class="footer">
                <p>
                    This link will expire in 24 hours for security reasons.
                </p>
                <p>
                    If you didn't create an account with ${appConfig.name}, you can safely ignore this email.
                </p>
                <p style="margin-top: 16px;">
                    — The ${appConfig.name} Team
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;
}

export function generateInvitationEmail(
	inviteLink: string,
	organizationName: string,
	inviterName?: string,
) {
	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 32px;
            margin-top: 20px;
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        h1 {
            color: #111827;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        p {
            color: #6b7280;
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 24px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 32px;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            text-align: center;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 0;
        }
        .link {
            color: #4f46e5;
            text-decoration: underline;
            word-break: break-all;
        }
        .org-badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: #f3f4f6;
            border-radius: 6px;
            font-weight: 600;
            color: #111827;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <h1 style="color: #4f46e5; font-size: 28px;">${appConfig.name}</h1>
            </div>

            <h1>You're Invited!</h1>

            <p>
                ${inviterName ? `${inviterName} has invited` : "You've been invited"} you to join <span class="org-badge">${organizationName}</span> on ${appConfig.name}.
            </p>

            <p>
                Join your team to collaborate on recruitment and hiring processes.
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>

            <p style="font-size: 14px; color: #9ca3af;">
                Or copy and paste this link into your browser:
                <br>
                <a href="${inviteLink}" class="link">${inviteLink}</a>
            </p>

            <div class="footer">
                <p>
                    This invitation link will expire in 7 days.
                </p>
                <p>
                    If you don't want to join this organization, you can safely ignore this email.
                </p>
                <p style="margin-top: 16px;">
                    — The ${appConfig.name} Team
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;
}
