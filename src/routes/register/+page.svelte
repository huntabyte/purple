<script lang="ts">
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input";
	import { registerSchema } from "$lib/zod-schemas.js";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(registerSchema),
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
		<Form.Field {form} name="passwordConfirm">
			<Form.Control let:attrs>
				<Form.Label>Confirm Password</Form.Label>
				<Input type="password" {...attrs} bind:value={$formData.passwordConfirm} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Errors errors={$errors._errors} />
		<Form.Button>Register</Form.Button>
	</form>
</div>
