import { z } from "zod";

export const verifyEmailTokenSchema = z.object({
	token: z.string().min(1, "Please enter the token you received in your email."),
});

export const newEmailVerificationTokenSchema = z.object({});
