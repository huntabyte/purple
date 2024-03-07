<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createPostSchema } from '$lib/zod-schemas.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();

	const createPostForm = superForm(data.createPostForm, {
		validators: zodClient(createPostSchema)
	});

	const { form: createPostFormData, enhance } = createPostForm;
</script>

<div class="container max-w-xl">
	{#if data.session}
		<form action="?/createPost" method="POST" use:enhance class="space-y-4">
			<Form.Field form={createPostForm} name="title">
				<Form.Control let:attrs>
					<Form.Label>Title</Form.Label>
					<Input {...attrs} bind:value={$createPostFormData.title} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field form={createPostForm} name="content">
				<Form.Control let:attrs>
					<Form.Label>Content</Form.Label>
					<Textarea {...attrs} bind:value={$createPostFormData.content} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Create Post</Form.Button>
		</form>
	{:else}
		<p>
			You need to be logged in to create a post <a href="/login" class="underline">Login now</a>
		</p>
	{/if}

	<pre>{JSON.stringify(data.posts, null, 2)}</pre>
</div>
