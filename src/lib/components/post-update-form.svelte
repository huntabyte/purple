<script lang="ts">
	import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { updatePostSchema } from "$lib/zod-schemas";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { untrack } from "svelte";
	import { getPostState } from "$lib/state.svelte";

	const data = getPostState();

	const form = superForm(data.updatePostForm, {
		id: `updatePostForm-${data.post.id}`,
		validators: zodClient(updatePostSchema),
		onUpdated: ({ form: updForm }) => {
			if (!updForm.valid) return;
			data.updateOpen = false;
		},
		resetForm: false,
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		const title = untrack(() => data.post.title);
		const content = untrack(() => data.post.title);
		$formData.title = title;
		$formData.content = content;
	});
</script>

<form action="?/updatePost&id={data.post.id}" method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="title">
		<Form.Control let:attrs>
			<Form.Label>Title</Form.Label>
			<Input {...attrs} bind:value={$formData.title} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="content">
		<Form.Control let:attrs>
			<Form.Label>Content</Form.Label>
			<Textarea {...attrs} bind:value={$formData.content} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Update Post</Form.Button>
</form>
