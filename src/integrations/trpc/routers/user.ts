import { members, users } from "@/lib/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
	/**
	 * Get current user info including role in active organization
	 */
	me: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const organizationId = ctx.session.session.activeOrganizationId;

		let role: string | null = null;

		if (organizationId) {
			const [membership] = await ctx.db
				.select({ role: members.role })
				.from(members)
				.where(
					and(
						eq(members.userId, userId),
						eq(members.organizationId, organizationId),
					),
				);
			role = membership?.role ?? null;
		}

		return {
			id: userId,
			name: ctx.session.user.name,
			email: ctx.session.user.email,
			image: ctx.session.user.image,
			role,
			organizationId,
		};
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				firstName: z.string().min(1, "First name is required"),
				lastName: z.string().optional(),
				bio: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const fullName = input.lastName
				? `${input.firstName} ${input.lastName}`.trim()
				: input.firstName;

			const updatedUser = await ctx.db
				.update(users)
				.set({
					name: fullName,
				})
				.where(eq(users.id, userId))
				.returning();

			if (!updatedUser[0]) {
				throw new Error("Failed to update profile");
			}

			return { success: true, user: updatedUser[0] };
		}),
});
