<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Form from "$lib/components/ui/form";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { buttonVariants } from "./ui/button";
	import { createPostSchema } from "$lib/zod-schemas";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { toast } from "svelte-sonner";

	type Props = {
		form: SuperValidated<Infer<typeof createPostSchema>>;
	};

	let { form: theForm }: Props = $props();

	let open = $state(false);

	const form = superForm(theForm, {
		id: `createPostForm`,
		validators: zodClient(createPostSchema),
		onUpdated: ({ form: updForm }) => {
			if (!updForm.valid) return;

			// success, show toast and close dialog
			toast.success("Post created successfully");
			open = false;
		},
	});

	const { form: createPostFormData, enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants()}>Create Post</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new post</Dialog.Title>
			<Dialog.Description>Start interacting with the community.</Dialog.Description>
		</Dialog.Header>
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
	</Dialog.Content>
</Dialog.Root>
