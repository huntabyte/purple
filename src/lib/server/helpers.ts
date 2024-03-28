import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { postsTable } from "./schemas";

export async function getPostById(postId: string) {
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
	});
}
