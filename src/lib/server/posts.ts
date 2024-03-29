import { createPostSchema, deletePostSchema, updatePostSchema } from "$lib/zod-schemas";
import { error, fail, redirect, type RequestEvent } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "./db";
import { likesTable, postsTable, sqliteDialect } from "./schemas";
import { and, eq, SQL, sql } from "drizzle-orm";
import { generateId } from "lucia";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

export async function deletePostAction(event: RequestEvent) {
	if (!event.locals.user) redirect(302, "/login");
	const form = await superValidate(event.url, zod(deletePostSchema));

	if (!form.valid) {
		setError(form, "", "Error deleting post");
		return {
			deletePostForm: form,
		};
	}

	const post = await getPostById(form.data.id, event.locals.user.id);

	if (!post || post.userId !== event.locals.user.id) {
		error(401, "You are not allowed to delete this post.");
	}

	await db.delete(postsTable).where(eq(postsTable.id, form.data.id));

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
	const post = await getPostById(postId, event.locals.user.id);

	if (!post || post.userId !== event.locals.user.id) {
		error(401, "You are not allowed to delete this post.");
	}

	await db.update(postsTable).set(form.data).where(eq(postsTable.id, postId));

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
	await db.insert(postsTable).values({ id: postId, ...form.data, userId: event.locals.user.id });

	return { createPostForm: form };
}

type CountRelationParams<T> = {
	name: T;
	fieldId: SQLiteColumn;
	refId: SQLiteColumn;
	refId2: SQLiteColumn;
	id: string;
};

export const userLikedCount = <const T extends string>({
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

export async function getPostById(postId: string, userId: string | undefined) {
	return await db.query.postsTable.findFirst({
		where: and(eq(postsTable.id, postId)),
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
				id: userId ?? "",
			}),
		}),
	});
}
