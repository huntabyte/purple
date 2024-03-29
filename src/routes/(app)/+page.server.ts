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
import {
	createPostAction,
	deletePostAction,
	updatePostAction,
	userLikedCount,
} from "$lib/server/posts";
import { createCommentAction } from "$lib/server/comments";
import { createLikeAction, deleteLikeAction } from "$lib/server/likes";
import { likesTable } from "$lib/server/schemas";

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user ? event.locals.user.id : "notarealid";
	async function getPosts() {
		return await db.query.postsTable.findMany({
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
			extras: (fields) => ({
				...userLikedCount({
					name: "userLiked",
					fieldId: fields.id,
					refId: likesTable.postId,
					refId2: likesTable.userId,
					id: userId,
				}),
			}),
		});
	}

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
