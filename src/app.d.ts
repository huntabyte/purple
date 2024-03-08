// See https://kit.svelte.dev/docs/types#app

import type { Infer, SuperValidated } from "sveltekit-superforms";
import { updatePostSchema } from "./lib/zod-schemas";

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
				form: SuperValidated<Infer<updatePostSchema>>;
				dialog: boolean;
			};
		}
		// interface Platform {}
	}
}

export {};
