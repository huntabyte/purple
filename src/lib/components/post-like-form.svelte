<script lang="ts">
	import Heart from "lucide-svelte/icons/heart";
	import { getPostState } from "$lib/state.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { createLikeSchema, deleteLikeSchema } from "$lib/zod-schemas";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";

	const { createLikeForm, deleteLikeForm, post } = getPostState();

	const createForm = superForm(createLikeForm, {
		id: `post-like-form-${post.id}`,
		validators: zodClient(createLikeSchema),
	});

	const deleteForm = superForm(deleteLikeForm, {
		id: `post-delete-form-${post.id}`,
		validators: zodClient(deleteLikeSchema),
	});

	const { enhance: createEnhance } = createForm;
	const { enhance: deleteEnhance } = deleteForm;
</script>

{#if post.userLiked}
	<form method="POST" action="/?/deleteLike&postId={post.id}" use:deleteEnhance>
		<Button variant="ghost" size="icon" class="gap-1" type="submit">
			<Heart class="size-4 text-rose-500" />
			{post.likes.length}
		</Button>
	</form>
{:else}
	<form method="POST" action="/?/createLike&postId={post.id}" use:createEnhance>
		<Button variant="ghost" size="icon" class="gap-1" type="submit">
			<Heart class="size-4" />
			{post.likes.length}
		</Button>
	</form>
{/if}
