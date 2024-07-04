<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import { type SVUpdateEmail, updateEmailSchema } from "./schemas";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";

	type Props = {
		updateEmailForm: SVUpdateEmail;
		pendingEmailChangeVerification: boolean;
		newEmailInput: HTMLInputElement | undefined;
		onCancel: () => void;
	};

	let {
		updateEmailForm,
		pendingEmailChangeVerification = $bindable(),
		newEmailInput = $bindable(),
		onCancel,
	}: Props = $props();

	const form = superForm(updateEmailForm, {
		validators: zodClient(updateEmailSchema),
		onUpdate: ({ result, form }) => {
			if (!form.message) return;
			if (result.type === "success") {
				toast.success(form.message.text);
				pendingEmailChangeVerification = true;
			} else {
				toast.error(form.message.text);
			}
		},
	});
	const { form: formData, enhance } = form;
</script>

<form use:enhance method="POST" action="?/updateEmail" class="flex flex-col gap-3">
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>New email</Form.Label>
			<Input bind:ref={newEmailInput} {...attrs} bind:value={$formData.email} />
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label>Current password</Form.Label>
			<Input type="password" {...attrs} bind:value={$formData.password} />
		</Form.Control>
		<Form.Description>
			Enter your current password to confirm the email change. A verification email will be sent to
			the new email address to complete the change.
		</Form.Description>
	</Form.Field>
	<div class="mt-2 flex items-center gap-4">
		<Button variant="secondary" onclick={onCancel}>Cancel</Button>
		<Button type="submit">Update Email</Button>
	</div>
</form>
