import { db } from "$lib/server/db";
import { superValidate } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import {
	createPostCommentSchema,
	createPostSchema,
	deletePostSchema,
	updatePostSchema,
} from "$lib/zod-schemas";

import { createPostAction, deletePostAction, updatePostAction } from "$lib/server/posts";
import { createCommentAction } from "$lib/server/comments";

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
	createPost: createPostAction,
	deletePost: deletePostAction,
	updatePost: updatePostAction,
	createComment: createCommentAction,
};
