import { db } from "$lib/server/db";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { updatePostSchema } from "$lib/zod-schemas";
import { z } from "zod";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { postsTable } from "$lib/server/schemas";
import { eq } from "drizzle-orm";
import { getPostById } from "$lib/server/posts";

export const load = async (event) => {
	if (!event.locals.user) redirect(302, "/login");

	const postId = event.params.id;
	const post = await getPostById(postId, event.locals.user.id);

	if (!post) error(404, "Post not found");

	const updatePostSchema = z.object({
		id: z.string().default(post.id),
		title: z
			.string()
			.min(3, "Title must be at least 3 characters.")
			.max(64, "Title must be at most 64 characters.")
			.default(post.title),
		content: z
			.string()
			.min(3, "Content must be at least 3 characters.")
			.max(512, "Content must be at most 512 characters.")
			.default(post.content),
	});

	const updatePostForm = await superValidate(event, zod(updatePostSchema));

	return {
		updatePostForm,
		post,
	};
};

export const actions: Actions = {
	updatePost: async (event) => {
		if (!event.locals.user) redirect(302, "/login");
		const form = await superValidate(event, zod(updatePostSchema));
		if (!form.valid) return fail(400, { form });

		await db
			.update(postsTable)
			.set({ title: form.data.title, content: form.data.content })
			.where(eq(postsTable.id, event.params.id));

		return { form };
	},
};
