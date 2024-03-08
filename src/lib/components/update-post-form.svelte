<script lang="ts">
	import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import type { SuperValidated, Infer } from "sveltekit-superforms";
	import { updatePostSchema } from "$lib/zod-schemas";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import type { Post } from "$lib/server/schemas";
	import { untrack } from "svelte";

	type Props = {
		form: SuperValidated<Infer<typeof updatePostSchema>>;
		post: Post;
		open: { value: boolean };
	};

	let { form: theForm, post, open } = $props<Props>();

	const form = superForm(theForm, {
		id: `updatePostForm-${post.id}`,
		validators: zodClient(updatePostSchema),
		onUpdated: ({ form: updForm }) => {
			if (!updForm.valid) return;
			open.value = false;
		},
		resetForm: false,
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		const title = untrack(() => post.title);
		const content = untrack(() => post.title);
		$formData.title = title;
		$formData.content = content;
	});
</script>

<form action="?/updatePost&id={post.id}" method="POST" use:enhance class="space-y-4">
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
