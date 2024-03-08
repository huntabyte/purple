import { db } from "$lib/server/db";
import { setError, superValidate } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { createPostSchema, deletePostSchema, updatePostSchema } from "$lib/zod-schemas";
import { fail, redirect } from "@sveltejs/kit";
import { posts } from "$lib/server/schemas";
import { generateId } from "lucia";
import { eq } from "drizzle-orm";
import { getPostById } from "$lib/server/helpers";

export const load: PageServerLoad = async () => {
	const createPostForm = await superValidate(zod(createPostSchema));
	const deletePostForm = await superValidate(zod(deletePostSchema));
	const updatePostForm = await superValidate(zod(updatePostSchema));

	const posts = await db.query.posts.findMany({
		orderBy: (posts, { desc }) => [desc(posts.createdAt)],
		with: {
			user: {
				columns: {
					username: true,
				},
			},
		},
	});

	return {
		posts,
		createPostForm,
		deletePostForm,
		updatePostForm,
	};
};

export const actions: Actions = {
	createPost: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event, zod(createPostSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const postId = generateId(15);

		// create post in db
		await db.insert(posts).values({ id: postId, ...form.data, userId: event.locals.user.id });

		return { form };
	},
	deletePost: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event.url, zod(deletePostSchema));

		if (!form.valid) {
			return setError(form, "", "Error deleting post");
		}

		if (!getPostById(form.data.id, event.locals.user.id)) {
			return setError(form, "", "Unable to delete post.");
		}

		await db.delete(posts).where(eq(posts.id, form.data.id));

		return {
			form,
		};
	},
	updatePost: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event, zod(updatePostSchema));
		if (!form.valid) return fail(400, { form });

		const postId = event.url.searchParams.get("id");
		if (!postId || !getPostById(postId, event.locals.user.id)) {
			return setError(form, "", "Unable to update post.");
		}

		await db.update(posts).set(form.data).where(eq(posts.id, postId));

		return { form };
	},
};
