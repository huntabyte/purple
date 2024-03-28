import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { posts } from "./schemas";

export async function getPostById(postId: string) {
	const post = await db.query.posts.findFirst({
		where: and(eq(posts.id, postId)),
		with: {
			user: { columns: { id: true, username: true } },
			comments: {
				columns: {
					content: true,
					id: true,
					createdAt: true,
				},
				with: {
					user: {
						columns: {
							username: true,
							id: true,
						},
					},
				},
			},
			likes: {
				columns: {
					id: true,
				},
				with: {
					user: {
						columns: {
							username: true,
							id: true,
						},
					},
				},
			},
		},
	});

	return post;
}
