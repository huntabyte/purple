import type { Infer, SuperValidated } from "sveltekit-superforms";
import { z } from "zod";

export const updateProfileSchema = z.object({
	displayName: z.string().nullable(),
	bio: z.string().nullable(),
});

export const updateEmailSchema = z.object({
	email: z.string().email(),
});

export type SuperValidatedUpdateProfile = SuperValidated<Infer<typeof updateProfileSchema>>;
