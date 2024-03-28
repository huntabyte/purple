import { createPostSchema, deletePostSchema, updatePostSchema } from "$lib/zod-schemas";
import { error, fail, redirect, type RequestEvent } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { getPostById } from "./helpers";
import { db } from "./db";
import { posts } from "./schemas";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";

export async function deletePostAction(event: RequestEvent) {
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
}

export async function updatePostAction(event: RequestEvent) {
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
}

export async function createPostAction(event: RequestEvent) {
	if (!event.locals.user) redirect(302, "/login");
	const form = await superValidate(event, zod(createPostSchema));

	if (!form.valid) {
		return fail(400, { createPostForm: form });
	}

	const postId = generateId(15);

	// create post in db
	await db.insert(posts).values({ id: postId, ...form.data, userId: event.locals.user.id });

	return { createPostForm: form };
}
