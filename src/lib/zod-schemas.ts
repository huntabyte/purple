import { z } from "zod";

export const registerSchema = z
	.object({
		email: z.string().email({ message: "Please enter a valid email address." }),
		password: z.string().min(4).max(255),
		passwordConfirm: z.string().min(4).max(255),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "Passwords do not match",
		path: ["passwordConfirm"],
	});

export const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address." }),
	password: z.string().min(1, "Please enter a password."),
});

export const verifyEmailTokenSchema = z.object({
	token: z.string().min(1, "Please enter the token you received in your email."),
});

export const newEmailVerificationTokenSchema = z.object({});
