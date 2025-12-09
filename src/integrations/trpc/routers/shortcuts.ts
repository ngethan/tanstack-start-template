import { userShortcuts } from "@/lib/db/schema/shortcuts";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const shortcutsRouter = createTRPCRouter({
	getUserShortcuts: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const shortcuts = await ctx.db
			.select()
			.from(userShortcuts)
			.where(eq(userShortcuts.userId, userId));

		return shortcuts;
	}),

	upsertShortcut: protectedProcedure
		.input(
			z.object({
				shortcutId: z.string().min(1),
				keys: z.array(z.string()).min(1),
				enabled: z.boolean().optional().default(true),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const existingShortcut = await ctx.db
				.select()
				.from(userShortcuts)
				.where(
					and(
						eq(userShortcuts.userId, userId),
						eq(userShortcuts.keys, input.keys),
					),
				);

			if (
				existingShortcut.length > 0 &&
				existingShortcut[0].shortcutId !== input.shortcutId
			) {
				throw new TRPCError({
					code: "CONFLICT",
					message: `Keyboard shortcut "${input.keys.join(" + ")}" is already assigned to "${existingShortcut[0].shortcutId}"`,
				});
			}

			const result = await ctx.db
				.insert(userShortcuts)
				.values({
					userId,
					shortcutId: input.shortcutId,
					keys: input.keys,
					enabled: input.enabled,
				})
				.onConflictDoUpdate({
					target: [userShortcuts.userId, userShortcuts.shortcutId],
					set: {
						keys: input.keys,
						enabled: input.enabled,
						updatedAt: new Date(),
					},
				})
				.returning();

			return result[0];
		}),

	upsertMultipleShortcuts: protectedProcedure
		.input(
			z.array(
				z.object({
					shortcutId: z.string().min(1),
					keys: z.array(z.string()).min(1),
					enabled: z.boolean().optional().default(true),
				}),
			),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const keyMap = new Map<string, string>();
			for (const shortcut of input) {
				const keyCombo = shortcut.keys.join("+");
				if (keyMap.has(keyCombo)) {
					throw new TRPCError({
						code: "CONFLICT",
						message: `Duplicate keyboard shortcut "${shortcut.keys.join(" + ")}" assigned to both "${keyMap.get(keyCombo)}" and "${shortcut.shortcutId}"`,
					});
				}
				keyMap.set(keyCombo, shortcut.shortcutId);
			}

			const existingShortcuts = await ctx.db
				.select()
				.from(userShortcuts)
				.where(eq(userShortcuts.userId, userId));

			for (const shortcut of input) {
				const conflict = existingShortcuts.find(
					(existing) =>
						existing.shortcutId !== shortcut.shortcutId &&
						existing.keys.length === shortcut.keys.length &&
						existing.keys.every((key, i) => key === shortcut.keys[i]),
				);

				if (conflict) {
					throw new TRPCError({
						code: "CONFLICT",
						message: `Keyboard shortcut "${shortcut.keys.join(" + ")}" is already assigned to "${conflict.shortcutId}"`,
					});
				}
			}

			const results = await Promise.all(
				input.map(async (shortcut) => {
					const result = await ctx.db
						.insert(userShortcuts)
						.values({
							userId,
							shortcutId: shortcut.shortcutId,
							keys: shortcut.keys,
							enabled: shortcut.enabled,
						})
						.onConflictDoUpdate({
							target: [userShortcuts.userId, userShortcuts.shortcutId],
							set: {
								keys: shortcut.keys,
								enabled: shortcut.enabled,
								updatedAt: new Date(),
							},
						})
						.returning();

					return result[0];
				}),
			);

			return results;
		}),

	resetShortcut: protectedProcedure
		.input(
			z.object({
				shortcutId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Import shortcut definitions to get default keys
			const { shortcutDefinitions } = await import("@/lib/shortcuts");
			const defaultShortcut = shortcutDefinitions.find(
				(s) => s.id === input.shortcutId,
			);

			if (!defaultShortcut) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Shortcut "${input.shortcutId}" not found`,
				});
			}

			// Check if default keys conflict with existing shortcuts
			const existingShortcuts = await ctx.db
				.select()
				.from(userShortcuts)
				.where(eq(userShortcuts.userId, userId));

			const conflict = existingShortcuts.find(
				(existing) =>
					existing.shortcutId !== input.shortcutId &&
					existing.enabled &&
					existing.keys.length === defaultShortcut.keys.length &&
					existing.keys.every((key, i) => key === defaultShortcut.keys[i]),
			);

			if (conflict) {
				throw new TRPCError({
					code: "CONFLICT",
					message: `Cannot reset: default keys "${defaultShortcut.keys.join(" + ")}" are already in use by "${conflict.shortcutId}"`,
				});
			}

			// Delete the custom shortcut to reset to default
			await ctx.db
				.delete(userShortcuts)
				.where(
					and(
						eq(userShortcuts.userId, userId),
						eq(userShortcuts.shortcutId, input.shortcutId),
					),
				);

			return { success: true };
		}),

	resetAllShortcuts: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		await ctx.db.delete(userShortcuts).where(eq(userShortcuts.userId, userId));

		return { success: true };
	}),
});
