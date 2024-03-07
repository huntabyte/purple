import { z } from 'zod';

export const registerSchema = z
	.object({
		username: z.string().min(3).max(30),
		password: z.string().min(4).max(255),
		passwordConfirm: z.string().min(4).max(255)
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirmation', 'password']
	});

export const loginSchema = z.object({
	username: z.string().min(3).max(30),
	password: z.string()
});

export const createPostSchema = z.object({
	title: z
		.string()
		.min(3, 'Title must be at least 3 characters.')
		.max(64, 'Title must be at most 64 characters.'),
	content: z
		.string()
		.min(3, 'Content must be at least 3 characters.')
		.max(512, 'Content must be at most 512 characters.')
});

export const deletePostSchema = z.object({
	id: z.string()
});

export const updatePostSchema = z.object({
	id: z.string(),
	title: z
		.string()
		.min(3, 'Title must be at least 3 characters.')
		.max(64, 'Title must be at most 64 characters.'),
	content: z
		.string()
		.min(3, 'Content must be at least 3 characters.')
		.max(512, 'Content must be at most 512 characters.')
});
