<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import { type SVUpdatePassword, updatePasswordSchema } from "../schemas";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Form from "$lib/components/ui/form";

	type Props = {
		updatePasswordForm: SVUpdatePassword;
	};

	let { updatePasswordForm }: Props = $props();

	const form = superForm(updatePasswordForm, {
		validators: zodClient(updatePasswordSchema),
		onUpdate: ({ result, form }) => {
			if (result.type === "success") {
				if (form.message) toast.success(form.message.text);
			} else {
				if (form.message) toast.error(form.message.text);
			}
		},
	});
	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto w-full max-w-xl">
	<Card.Header>
		<Card.Title>Password</Card.Title>
		<Card.Description>Change your password.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form use:enhance method="POST" action="?/updatePassword" class="flex flex-col gap-3">
			<Form.Field {form} name="currentPassword">
				<Form.Control let:attrs>
					<Form.Label>Current password</Form.Label>
					<Input {...attrs} type="password" bind:value={$formData.currentPassword} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="newPassword">
				<Form.Control let:attrs>
					<Form.Label>New password</Form.Label>
					<Input {...attrs} type="password" bind:value={$formData.newPassword} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="newPasswordConfirm">
				<Form.Control let:attrs>
					<Form.Label>Confirm new password</Form.Label>
					<Input {...attrs} type="password" bind:value={$formData.newPasswordConfirm} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Button type="submit" class="mt-2 self-start">Change Password</Button>
		</form>
	</Card.Content>
</Card.Root>
