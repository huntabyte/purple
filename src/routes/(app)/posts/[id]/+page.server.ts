import {
	createPostCommentSchema,
	createPostSchema,
	deletePostSchema,
	updatePostSchema,
} from "$lib/zod-schemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const load = async () => {
	const [createPostForm, deletePostForm, updatePostForm, createCommentForm] = await Promise.all([
		superValidate(zod(createPostSchema)),
		superValidate(zod(deletePostSchema)),
		superValidate(zod(updatePostSchema)),
		superValidate(zod(createPostCommentSchema)),
	]);

	return {
		createPostForm,
		deletePostForm,
		updatePostForm,
		createCommentForm,
	};
};
