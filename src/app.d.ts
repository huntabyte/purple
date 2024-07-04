// See https://kit.svelte.dev/docs/types#app

import type { Infer, SuperValidated } from "sveltekit-superforms";
import type { updatePostSchema } from "./lib/zod-schemas";
import type { ErrorCode } from "$lib/errors";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import("lucia").User | null;
			session: import("lucia").Session | null;
			setSessionCookie: (sessionCookie: import("lucia").Cookie) => void;
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

		// interface Error {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				code?: ErrorCode;
				type: "error" | "success";
				text: string;
			};
		}
	}
}

export {};
