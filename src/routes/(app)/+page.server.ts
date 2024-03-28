import { db } from "$lib/server/db";
import { superValidate } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import {
	createLikeSchema,
	createPostCommentSchema,
	createPostSchema,
	deleteLikeSchema,
	deletePostSchema,
	updatePostSchema,
} from "$lib/zod-schemas";

import { createPostAction, deletePostAction, updatePostAction } from "$lib/server/posts";
import { createCommentAction } from "$lib/server/comments";
import { createLikeAction, deleteLikeAction } from "$lib/server/likes";
import { countRelation, likes } from "$lib/server/schemas";

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user ? event.locals.user.id : "notarealid";
	async function getPosts() {
		return await db.query.posts.findMany({
			orderBy: (posts, { desc }) => [desc(posts.createdAt)],
			columns: {
				id: true,
				content: true,
			},
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
			extras: (fields) => ({
				...countRelation("userLiked", fields.id, likes.postId, likes.userId, userId),
			}),
		});
	}

	// async function withHasLiked(posts: Awaited<ReturnType<typeof getPosts>>) {

	// }

	const [
		createPostForm,
		deletePostForm,
		updatePostForm,
		createCommentForm,
		createLikeForm,
		deleteLikeForm,
		postsArr,
	] = await Promise.all([
		superValidate(zod(createPostSchema)),
		superValidate(zod(deletePostSchema)),
		superValidate(zod(updatePostSchema)),
		superValidate(zod(createPostCommentSchema)),
		superValidate(zod(createLikeSchema)),
		superValidate(zod(deleteLikeSchema)),
		getPosts(),
	]);

	return {
		posts: postsArr,
		createPostForm,
		deletePostForm,
		updatePostForm,
		createCommentForm,
		createLikeForm,
		deleteLikeForm,
	};
};

export const actions: Actions = {
	createPost: createPostAction,
	deletePost: deletePostAction,
	updatePost: updatePostAction,
	createComment: createCommentAction,
	createLike: createLikeAction,
	deleteLike: deleteLikeAction,
};
