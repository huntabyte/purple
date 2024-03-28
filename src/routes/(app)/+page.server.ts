import { db } from "$lib/server/db";
import { setError, superValidate } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import {
	createPostCommentSchema,
	createPostSchema,
	deletePostSchema,
	updatePostSchema,
} from "$lib/zod-schemas";
import { error, fail, redirect } from "@sveltejs/kit";
import { comments, posts } from "$lib/server/schemas";
import { generateId } from "lucia";
import { eq } from "drizzle-orm";
import { getPostById } from "$lib/server/helpers";

export const load: PageServerLoad = async () => {
	const createPostForm = await superValidate(zod(createPostSchema));
	const deletePostForm = await superValidate(zod(deletePostSchema));
	const updatePostForm = await superValidate(zod(updatePostSchema));
	const createCommentForm = await superValidate(zod(createPostCommentSchema));

	const posts = await db.query.posts.findMany({
		orderBy: (posts, { desc }) => [desc(posts.createdAt)],
		with: {
			user: true,
			comments: {
				with: {
					user: true,
				},
			},
			likes: {
				with: {
					user: true,
				},
			},
		},
	});

	return {
		posts,
		createPostForm,
		deletePostForm,
		updatePostForm,
		createCommentForm,
	};
};

export const actions: Actions = {
	createPost: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event, zod(createPostSchema));

		if (!form.valid) {
			return fail(400, { createPostForm: form });
		}

		const postId = generateId(15);

		// create post in db
		await db.insert(posts).values({ id: postId, ...form.data, userId: event.locals.user.id });

		return { createPostForm: form };
	},
	deletePost: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event.url, zod(deletePostSchema));

		if (!form.valid) {
			setError(form, "", "Error deleting post");
			return {
				deletePostForm: form,
			};
		}

		const post = await getPostById(form.data.id);

		if (!post || post.userId !== event.locals.user.id) {
			error(401, "You are not allowed to delete this post.");
		}

		await db.delete(posts).where(eq(posts.id, form.data.id));

		return {
			deletePostForm: form,
		};
	},
	updatePost: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event, zod(updatePostSchema));
		if (!form.valid) return fail(400, { updatePostForm: form });

		const postId = event.url.searchParams.get("id");
		if (!postId) error(400, "Invalid postId");
		const post = await getPostById(postId);

		if (!post || post.userId !== event.locals.user.id) {
			error(401, "You are not allowed to delete this post.");
		}

		await db.update(posts).set(form.data).where(eq(posts.id, postId));

		return { updatePostForm: form };
	},
	createComment: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event, zod(createPostCommentSchema));
		if (!form.valid) {
			return fail(400, { createCommentForm: form });
		}

		const postId = event.url.searchParams.get("postId");
		if (!postId) error(400, "Invalid postId");

		const post = await getPostById(postId);

		if (!post) error(400, "Invalid post");

		await db.insert(comments).values({ ...form.data, postId, userId: event.locals.user.id });

		return {
			createCommentForm: form,
		};
	},
};
