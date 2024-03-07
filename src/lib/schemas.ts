import { z } from 'zod';

export const registerSchema = z
	.object({
		username: z.string().min(3).max(30),
		password: z.string().min(8).max(255),
		passwordConfirm: z.string().min(8).max(255)
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirmation', 'password']
	});

export const loginSchema = z.object({
	username: z.string().min(3).max(30),
	password: z.string()
});
