<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { loginSchema } from '$lib/zod-schemas.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(loginSchema)
	});

	const { form: formData, enhance, errors } = form;
</script>

<div class="mx-auto flex max-w-xl py-8">
	<form method="POST" use:enhance class="w-full space-y-4">
		<Form.Field {form} name="username">
			<Form.Control let:attrs>
				<Form.Label>Username</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.username} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="password">
			<Form.Control let:attrs>
				<Form.Label>Password</Form.Label>
				<Input type="password" {...attrs} bind:value={$formData.password} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div class="text-destructive" aria-live="assertive">
			{#if $errors._errors}
				{#each $errors._errors as error}
					<p>{error}</p>
				{/each}
			{/if}
		</div>

		<Form.Button>Login</Form.Button>
	</form>
</div>

<div>errors:</div>
<SuperDebug data={$errors} />
<div>data:</div>
<SuperDebug data={$formData} />
