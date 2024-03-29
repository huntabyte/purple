<script lang="ts">
	import Heart from "lucide-svelte/icons/heart";
	import { getPostState } from "$lib/state.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { createLikeSchema, deleteLikeSchema } from "$lib/zod-schemas";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";

	const postState = getPostState();

	const createForm = superForm(postState.createLikeForm, {
		id: `post-like-form-${postState.post.id}`,
		validators: zodClient(createLikeSchema),
	});

	const deleteForm = superForm(postState.deleteLikeForm, {
		id: `post-delete-form-${postState.post.id}`,
		validators: zodClient(deleteLikeSchema),
	});

	const { enhance: createEnhance } = createForm;
	const { enhance: deleteEnhance } = deleteForm;
</script>

{#if postState.post.userLiked}
	<form method="POST" action="/?/deleteLike&postId={postState.post.id}" use:deleteEnhance>
		<Button variant="ghost" size="icon" class="gap-1" type="submit">
			<Heart class="size-4 text-rose-500" />
			{postState.post.likes.length}
		</Button>
	</form>
{:else}
	<form method="POST" action="/?/createLike&postId={postState.post.id}" use:createEnhance>
		<Button variant="ghost" size="icon" class="gap-1" type="submit">
			<Heart class="size-4" />
			{postState.post.likes.length}
		</Button>
	</form>
{/if}
