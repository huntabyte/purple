<script lang="ts">
	import * as Form from "$lib/components/ui/form";

	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { Textarea } from "./ui/textarea";
	import { createPostCommentSchema } from "$lib/zod-schemas";
	import { getPostState } from "$lib/state.svelte";
	import { page } from "$app/stores";

	const data = getPostState();

	const form = superForm(data.createCommentForm, {
		id: `post-comment-form-${data.post.id}`,
		validators: zodClient(createPostCommentSchema),
		onUpdated: () => {
			data.commentOpen = false;
		},
	});

	const { form: formData, enhance } = form;

	$page; // eslint-disable-line svelte/valid-compile
</script>

{#if data.commentOpen}
	<form action="?/createComment&postId={data.post.id}" method="POST" use:enhance class="w-full">
		<Form.Field {form} name="content">
			<Form.Control let:attrs>
				<Form.Label>Leave a note</Form.Label>
				<Textarea {...attrs} bind:value={$formData.content} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button>Add comment</Form.Button>
	</form>
{/if}
