<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import AuthPage from "../auth-page.svelte";
	import { registerSchema } from "./schemas";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input";

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(registerSchema),
	});

	const { form: formData, enhance, errors } = form;
</script>

<AuthPage type="register">
	<div class="flex flex-col space-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
		<p class="text-sm text-muted-foreground">Start building your digital community today.</p>
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
	<p class="px-8 text-center text-sm text-muted-foreground">
		By clicking continue, you agree to our
		<a href="/terms" class="underline underline-offset-4 hover:text-primary"> Terms of Service </a>
		and
		<a href="/privacy" class="underline underline-offset-4 hover:text-primary"> Privacy Policy </a>
		.
	</p>
</AuthPage>
