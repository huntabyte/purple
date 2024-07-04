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

export type SuperValidatedUpdateProfile = SuperValidated<Infer<typeof updateProfileSchema>>;
export type SuperValidatedUpdateEmail = SuperValidated<Infer<typeof updateEmailSchema>>;
