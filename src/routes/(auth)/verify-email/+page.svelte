<script lang="ts">
	import { verifyEmailTokenSchema } from "$lib/zod-schemas.js";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zodClient(verifyEmailTokenSchema),
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="token">
		<Form.Control let:attrs>
			<Form.Label>Enter the token</Form.Label>
			<Input {...attrs} bind:value={$formData.token} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Verify email</Form.Button>
</form>
