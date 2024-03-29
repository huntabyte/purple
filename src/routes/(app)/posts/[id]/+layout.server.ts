import { getPostById } from "$lib/server/posts.js";
import { error } from "@sveltejs/kit";

export const load = async (event) => {
	const post = await getPostById(event.params.id, event.locals.user?.id);

	if (!post) error(404, "Post not found.");
	return { post };
};
