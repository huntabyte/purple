<script lang="ts">
	import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { createPostSchema } from "$lib/zod-schemas";
	import { toast } from "svelte-sonner";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";

	type Props = {
		createPostForm: SuperValidated<Infer<typeof createPostSchema>>;
	};

	const { createPostForm }: Props = $props();

	const form = superForm(createPostForm, {
		id: `createPostForm`,
		validators: zodClient(createPostSchema),
		onUpdated: ({ form: updForm }) => {
			if (!updForm.valid) return;

			// success, show toast and close dialog
			toast.success("Post created successfully");
		},
	});

	const { form: createPostFormData, enhance } = form;
</script>

<form action="?/createPost" method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="title">
		<Form.Control let:attrs>
			<Form.Label>Title</Form.Label>
			<Input {...attrs} bind:value={$createPostFormData.title} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="content">
		<Form.Control let:attrs>
			<Form.Label>Content</Form.Label>
			<Textarea {...attrs} bind:value={$createPostFormData.content} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Create Post</Form.Button>
</form>
