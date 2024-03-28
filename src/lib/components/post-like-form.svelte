<script lang="ts">
	import Heart from "lucide-svelte/icons/heart";
	import { getPostState } from "$lib/state.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { createLikeSchema } from "$lib/zod-schemas";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";

	const { createLikeForm, post } = getPostState();

	const form = superForm(createLikeForm, {
		id: `post-like-form-${post.id}`,
		validators: zodClient(createLikeSchema),
		onUpdated: () => {},
		onResult: ({ result }) => {
			console.log(result);
		},
	});

	const { enhance } = form;
</script>

<form method="POST" action="/?/createLike&postId={post.id}" use:enhance>
	{#if post.userLiked}
		<Button
			variant="ghost"
			size="icon"
			class="gap-1"
			type="submit"
			formaction="/?/deleteLike&postId={post.id}"
		>
			<Heart class="size-4 text-rose-500" />
			{post.likes.length}
		</Button>
	{:else}
		<Button variant="ghost" size="icon" class="gap-1" type="submit">
			<Heart class="size-4" />
			{post.likes.length}
		</Button>
	{/if}
</form>
