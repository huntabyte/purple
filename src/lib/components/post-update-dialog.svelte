<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { getPostState } from "$lib/state.svelte";
	import PostUpdateForm from "./post-update-form.svelte";

	const data = getPostState();
</script>

<Dialog.Root bind:open={data.updateOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit post</Dialog.Title>
		</Dialog.Header>
		<PostUpdateForm />
	</Dialog.Content>
</Dialog.Root>
