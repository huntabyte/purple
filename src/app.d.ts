// See https://kit.svelte.dev/docs/types#app

import type { Infer, SuperValidated } from "sveltekit-superforms";
import { updatePostSchema } from "./lib/zod-schemas";
import type { Post } from "$lib/server/schemas";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import("lucia").User | null;
			session: import("lucia").Session | null;
		}
		interface PageData {
			user: import("lucia").User | null;
			session: import("lucia").Session | null;
		}
		interface PageState {
			updatePost: {
				data: {
					updatePostForm: SuperValidated<Infer<Required<typeof updatePostSchema>>>;
					postId: string;
				};
				dialog: boolean;
			};
		}
		// interface Platform {}
	}
}

export {};
