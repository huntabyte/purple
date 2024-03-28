import { getPostById } from "$lib/server/helpers.js";
import { error } from "@sveltejs/kit";

export const load = async (event) => {
	const post = await getPostById(event.params.id);

	if (!post) error(404, "Post not found.");
	return { post };
};
