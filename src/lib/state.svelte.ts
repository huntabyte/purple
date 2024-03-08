import type { Infer, SuperValidated } from "sveltekit-superforms";
import type { PostWithUser } from "./server/schemas";
import type { createPostCommentSchema, deletePostSchema, updatePostSchema } from "./zod-schemas";
import { getContext, setContext } from "svelte";

export class Ref<T> {
	value = $state() as T;

	constructor(value: T) {
		this.value = value;
	}
}

export function ref<T>(initialValue: T) {
	return new Ref(initialValue);
}

type SetPostState = {
	post: PostWithUser;
	deletePostForm: SuperValidated<Infer<typeof deletePostSchema>>;
	updatePostForm: SuperValidated<Infer<typeof updatePostSchema>>;
	createCommentForm: SuperValidated<Infer<typeof createPostCommentSchema>>;
};
export class PostState {
	deletePostForm: SuperValidated<Infer<typeof deletePostSchema>> = $state() as SuperValidated<
		Infer<typeof deletePostSchema>
	>;
	updatePostForm: SuperValidated<Infer<typeof updatePostSchema>> = $state() as SuperValidated<
		Infer<typeof updatePostSchema>
	>;
	createCommentForm: SuperValidated<Infer<typeof createPostCommentSchema>> =
		$state() as SuperValidated<Infer<typeof createPostCommentSchema>>;
	deleteOpen = $state(false);
	dropdownOpen = $state(false);
	updateOpen = $state(false);
	commentOpen = $state(false);
	post: PostWithUser = $state() as PostWithUser;

	constructor(init: SetPostState) {
		this.deletePostForm = init.deletePostForm;
		this.updatePostForm = init.updatePostForm;
		this.createCommentForm = init.createCommentForm;
		this.post = init.post;
	}
}

const POST_CTX = Symbol("post_ctx");

export function setPostState(init: SetPostState) {
	const postState = new PostState(init);
	setContext<PostState>(POST_CTX, postState);
	return postState;
}

export function getPostState() {
	return getContext<PostState>(POST_CTX);
}
