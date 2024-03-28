import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { posts } from "./schemas";

export async function getPostById(postId: string) {
	const post = await db.query.posts.findFirst({
		where: and(eq(posts.id, postId)),
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

	return post;
}
