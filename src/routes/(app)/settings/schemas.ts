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

export type SVUpdateProfile = SuperValidated<Infer<typeof updateProfileSchema>>;
export type SVUpdateEmail = SuperValidated<Infer<typeof updateEmailSchema>>;
export type SVVerifyEmailChange = SuperValidated<Infer<typeof verifyEmailChangeSchema>>;
export type SVCancelEmailChange = SuperValidated<Infer<typeof cancelEmailChangeRequestSchema>>;
