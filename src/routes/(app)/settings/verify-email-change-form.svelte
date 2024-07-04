<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import { type SVVerifyEmailChange, verifyEmailChangeSchema } from "./schemas";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";

	type Props = {
		verifyEmailChangeForm: SVVerifyEmailChange;
		onConfirm: () => void;
	};

	let { verifyEmailChangeForm, onConfirm }: Props = $props();

	const form = superForm(verifyEmailChangeForm, {
		validators: zodClient(verifyEmailChangeSchema),
		onUpdate: ({ result, form }) => {
			if (result.type === "success") {
				if (form.message) toast.success(form.message.text);
				onConfirm();
			} else {
				if (form.message) toast.error(form.message.text);
			}
		},
	});
	const { form: formData, enhance } = form;
</script>

<form use:enhance method="POST" action="?/verifyEmailChange" class="flex flex-col gap-3">
	<Form.Field {form} name="token">
		<Form.Control let:attrs>
			<Form.Label>Verification code</Form.Label>
			<Input {...attrs} bind:value={$formData.token} />
		</Form.Control>
	</Form.Field>
	<Button type="submit" class="mt-2 self-start">Confirm Email Change</Button>
</form>
