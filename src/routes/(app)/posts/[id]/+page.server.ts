import {
	createLikeSchema,
	createPostCommentSchema,
	createPostSchema,
	deleteLikeSchema,
	deletePostSchema,
	updatePostSchema,
} from "$lib/zod-schemas";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

export const load = async () => {
	const [
		createPostForm,
		deletePostForm,
		updatePostForm,
		createCommentForm,
		createLikeForm,
		deleteLikeForm,
	] = await Promise.all([
		superValidate(zod(createPostSchema)),
		superValidate(zod(deletePostSchema)),
		superValidate(zod(updatePostSchema)),
		superValidate(zod(createPostCommentSchema)),
		superValidate(zod(createLikeSchema)),
		superValidate(zod(deleteLikeSchema)),
	]);

	return {
		createPostForm,
		deletePostForm,
		updatePostForm,
		createCommentForm,
		createLikeForm,
		deleteLikeForm,
	};
};
