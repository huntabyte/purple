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

export const createPostSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters.")
		.max(64, "Title must be at most 64 characters."),
	content: z
		.string()
		.min(3, "Content must be at least 3 characters.")
		.max(512, "Content must be at most 512 characters."),
});

export const deletePostSchema = z.object({
	id: z.string(),
});

export const updatePostSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters.")
		.max(64, "Title must be at most 64 characters."),
	content: z
		.string()
		.min(3, "Content must be at least 3 characters.")
		.max(512, "Content must be at most 512 characters."),
});

export const createPostCommentSchema = z.object({
	content: z.string().min(1).max(512),
});

export const createLikeSchema = z.object({
	postId: z.string(),
});

export const deleteLikeSchema = z.object({
	postId: z.string(),
});

export const verifyEmailTokenSchema = z.object({
	token: z.string().min(1, "Please enter the token you received in your email."),
});

export const newEmailVerificationTokenSchema = z.object({});
