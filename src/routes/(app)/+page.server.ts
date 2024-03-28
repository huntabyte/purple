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
import { likes, sqliteDialect } from "$lib/server/schemas";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { SQL, sql } from "drizzle-orm";

type CountRelationParams<T> = {
	name: T;
	fieldId: SQLiteColumn;
	refId: SQLiteColumn;
	refId2: SQLiteColumn;
	id: string;
};
const countRelation = <const T extends string>({
	name,
	fieldId,
	refId,
	refId2,
	id,
}: CountRelationParams<T>): { [Key in T]: SQL.Aliased<number> } => {
	const sqlChunks = sql`(SELECT COUNT(*) FROM ${refId.table} WHERE ${refId} = ${fieldId} AND ${refId2} = '${sql.raw(id)}')`;
	const rawSQL = sql.raw(sqliteDialect.sqlToQuery(sqlChunks).sql);

	return {
		[name]: rawSQL.mapWith(Number).as(name),
	} as { [Key in T]: SQL.Aliased<number> };
};

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user ? event.locals.user.id : "notarealid";
	async function getPosts() {
		return await db.query.posts.findMany({
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
				...countRelation({
					name: "userLiked",
					fieldId: fields.id,
					refId: likes.postId,
					refId2: likes.userId,
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
