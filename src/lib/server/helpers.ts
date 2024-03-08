import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { posts } from "./schemas";

export async function getPostById(postId: string, userId: string) {
	const post = await db.query.posts.findFirst({
		where: and(eq(posts.id, postId), eq(posts.userId, userId)),
		with: { user: { columns: { id: true } } },
	});

	return post;
}
