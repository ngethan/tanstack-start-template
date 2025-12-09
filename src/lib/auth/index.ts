import { env } from "@/env";
import { ac, admin, member, owner } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/auth";
import {
	generateInvitationEmail,
	generateResetPasswordEmail,
	generateVerificationEmail,
	sendEmail,
} from "@/lib/email/resend";
import { generateRandomAvatar } from "@/lib/utils/avatar";
import { type User, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	// captcha,
	oneTap,
	organization,
	phoneNumber,
	twoFactor,
} from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import { eq } from "drizzle-orm";
import { getBaseURL } from "../utils";

export const auth = betterAuth({
	appName: "TanStack Starter",
	baseURL: getBaseURL(),
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
		schema,
	}),
	plugins: [
		// captcha({
		// 	provider: "cloudflare-turnstile",
		// 	secretKey: env.TURNSTILE_SECRET_KEY,
		// }),
		reactStartCookies(),
		twoFactor(),
		phoneNumber({
			sendOTP: ({ phoneNumber, code }, request) => {
				console.log(phoneNumber, code, request);
				// Implement sending OTP code via SMS
			},
		}),
		oneTap(),
		organization({
			ac,
			roles: { member, admin, owner },
			requireEmailVerificationOnInvitation: true,

			async sendInvitationEmail(data) {
				// Generate invitation link using the invitation ID or email
				const inviteLink = `${getBaseURL()}/accept-invitation?id=${data.invitation.id}`;
				const emailHtml = generateInvitationEmail(
					inviteLink,
					data.organization.name,
					// @ts-ignore - inviter.user might exist depending on the invitation type
					data.inviter?.user?.name || data.inviter?.name,
				);

				try {
					await sendEmail({
						to: data.email,
						subject: `You're invited to join ${data.organization.name}`,
						html: emailHtml,
					});
				} catch (error) {
					console.error("Failed to send invitation email:", error);
					throw new Error("Failed to send invitation email");
				}
			},

			teams: {
				enabled: true,
			},

			allowUserToCreateOrganization: async (_user: User) => {
				// Allow users to create organizations
				return true;
			},
		}),
	],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		sendResetPassword: async (
			{ user, url }: { user: User; url: string; token: string },
			_request?: Request,
		) => {
			const emailHtml = generateResetPasswordEmail(url, user.name);

			try {
				await sendEmail({
					to: user.email,
					subject: "Reset Your Password - TanStack Starter",
					html: emailHtml,
				});
			} catch (error) {
				console.error("Failed to send reset password email:", error);
				throw new Error("Failed to send reset password email");
			}
		},
	},
	emailVerification: {
		sendVerificationEmail: async (
			{ user, url }: { user: User; url: string; token: string },
			_request?: Request,
		) => {
			const emailHtml = generateVerificationEmail(url, user.name);

			try {
				await sendEmail({
					to: user.email,
					subject: "Verify Your Email - TanStack Starter",
					html: emailHtml,
				});
			} catch (error) {
				console.error("Failed to send verification email:", error);
				throw new Error(`Failed to send verification email: ${error}`);
			}
		},
	},
	socialProviders: {
		google: {
			clientId: env.VITE_GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	user: {
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ user, newEmail, url }) => {
				const emailHtml = generateVerificationEmail(url, user.name);
				await sendEmail({
					to: newEmail,
					subject: "Verify Your New Email - TanStack Starter",
					html: emailHtml,
				});
			},
		},
		deleteUser: {
			enabled: false,
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
		},
	},
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					// Auto-set active organization to the user's first organization
					const [membership] = await db
						.select({ organizationId: schema.members.organizationId })
						.from(schema.members)
						.where(eq(schema.members.userId, session.userId))
						.limit(1);

					if (membership) {
						return {
							data: {
								...session,
								activeOrganizationId: membership.organizationId,
							},
						};
					}

					return { data: session };
				},
			},
		},
		user: {
			create: {
				after: async (user: User) => {
					// Set default avatar if none provided
					if (!user.image && user.email) {
						const avatarUrl = generateRandomAvatar(user.email);
						await db
							.update(schema.users)
							.set({ image: avatarUrl })
							.where(eq(schema.users.id, user.id));
					}
				},
			},
		},
	},
});
