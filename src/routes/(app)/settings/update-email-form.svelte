<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { tick } from "svelte";
	import { type SuperValidatedUpdateEmail, updateEmailSchema } from "./schemas";
	import { page } from "$app/stores";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Form from "$lib/components/ui/form";

	type Props = {
		updateEmailForm: SuperValidatedUpdateEmail;
	};

	let { updateEmailForm }: Props = $props();

	let updatingEmail = $state(false);
	let newEmailInput = $state<HTMLInputElement | undefined>();

	$effect(() => {
		if (updatingEmail) {
			tick().then(() => {
				newEmailInput?.focus();
			});
		}
	});

	const form = superForm(updateEmailForm, {
		validators: zodClient(updateEmailSchema),
	});
	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto w-full max-w-xl">
	<Card.Header>
		<Card.Title>Email</Card.Title>
		<Card.Description>Update the email address associated with your account.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if updatingEmail}
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
						Enter your current password to confirm the email change. A verification email will be
						sent to the new email address to complete the change.
					</Form.Description>
				</Form.Field>
				<div class="mt-2 flex items-center gap-4">
					<Button type="submit">Update Email</Button>
					<Button variant="secondary" onclick={() => (updatingEmail = false)}>Cancel</Button>
				</div>
			</form>
		{:else}
			<div class="flex flex-col gap-2">
				<Label>Current email</Label>
				<Input
					readonly
					aria-label="Current account email"
					value={$page.data.user?.email}
					class="pointer-events-none bg-muted text-muted-foreground"
				/>
				<Button class="mt-2 self-start" onclick={() => (updatingEmail = true)}>Change Email</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
