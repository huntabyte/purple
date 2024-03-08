<script lang="ts">
	import * as Form from "$lib/components/ui/form";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { updatePostSchema } from "$lib/zod-schemas";
	import { toast } from "svelte-sonner";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import type { PageData } from "./$types.js";

	type Props = {
		data: PageData;
		dialog: boolean;
	};

	let { data, dialog = false } = $props<Props>();

	let dialogOpen = $state(false);

	const form = superForm(data.updatePostForm, {
		validators: zodClient(updatePostSchema),
		onUpdated: ({ form: updForm }) => {
			if (!updForm.valid) return;

			// success, show toast and close dialog
			toast.success("Post updated successfully");
			// close dialog if relevant
			if (dialog && dialogOpen) dialogOpen = false;
		},
		resetForm: false,
	});

	const { form: formData, enhance } = form;
</script>

{#snippet UpdateForm()}
	<form action="?/updatePost" method="POST" use:enhance class="space-y-4">
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
{/snippet}

{#if dialog}
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Update post</Dialog.Title>
			</Dialog.Header>
			{@render UpdateForm()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="container mx-auto max-w-xl">
		<Card.Root>
			<Card.Header>
				<Card.Title>Update post</Card.Title>
			</Card.Header>
			<Card.Content>
				{@render UpdateForm()}
			</Card.Content>
		</Card.Root>
	</div>
{/if}
