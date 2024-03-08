<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import { getPostState } from "$lib/state.svelte";
	import { deletePostSchema } from "$lib/zod-schemas";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";

	const data = getPostState();

	const form = superForm(data.deletePostForm, {
		validators: zodClient(deletePostSchema),
		onUpdated: () => {
			data.deleteOpen = false;
		},
		id: `deletePostForm-${data.post.id}`,
	});

	const { enhance } = form;
</script>

<AlertDialog.Root bind:open={data.deleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Post</AlertDialog.Title>
			<AlertDialog.Description>Are you sure you want to delete this post?</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form use:enhance method="POST" action="?/deletePost&id={data.post.id}">
				<Button class={buttonVariants({ variant: "destructive" })} type="submit"
					>Yes, delete.</Button
				>
			</form>
			<AlertDialog.Cancel
				class={buttonVariants({ variant: "outline" })}
				onclick={() => (data.deleteOpen = false)}>No, cancel.</AlertDialog.Cancel
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
