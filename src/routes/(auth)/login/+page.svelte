<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import AuthPage from "../auth-page.svelte";
	import { loginSchema } from "./schemas";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input";

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(loginSchema),
	});

	const { form: formData, enhance, errors } = form;
</script>

<AuthPage type="login">
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Login to your account</h1>
		<p class="text-sm text-muted-foreground">Start participating in the conversation.</p>
	</div>
	<form method="POST" use:enhance class="w-full space-y-4">
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<Form.Label>Email</Form.Label>
				<Input type="text" {...attrs} bind:value={$formData.email} />
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
		<Form.Errors errors={$errors._errors} />
		<Form.Button>Login</Form.Button>
	</form>
</AuthPage>
