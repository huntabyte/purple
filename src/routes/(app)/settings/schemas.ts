import type { Infer, SuperValidated } from "sveltekit-superforms";
import { z } from "zod";

export const updateProfileSchema = z.object({
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
});

export const updateEmailSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const verifyEmailChangeSchema = z.object({
	token: z.string(),
});

export const cancelEmailChangeRequestSchema = z.object({
	userId: z.string(),
});

export const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(4, "Password must be at least 4 characters.")
			.max(255, "Password must be less than 256 characters."),
		newPasswordConfirm: z.string().min(4).max(255),
	})
	.refine((data) => data.newPassword === data.newPasswordConfirm, {
		message: "Passwords do not match",
		path: ["newPasswordConfirm"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "New password must be different from the current password",
		path: ["newPassword"],
	});

export type SVUpdateProfile = SuperValidated<Infer<typeof updateProfileSchema>>;
export type SVUpdateEmail = SuperValidated<Infer<typeof updateEmailSchema>>;
export type SVVerifyEmailChange = SuperValidated<Infer<typeof verifyEmailChangeSchema>>;
export type SVCancelEmailChange = SuperValidated<Infer<typeof cancelEmailChangeRequestSchema>>;
export type SVUpdatePassword = SuperValidated<Infer<typeof updatePasswordSchema>>;
