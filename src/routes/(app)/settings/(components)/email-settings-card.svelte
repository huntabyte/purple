<script lang="ts">
	import { tick } from "svelte";
	import {
		type SVCancelEmailChange,
		type SVUpdateEmail,
		type SVVerifyEmailChange,
	} from "../schemas";
	import VerifyEmailChangeForm from "./verify-email-change-form.svelte";
	import UpdateEmailForm from "./update-email-form.svelte";
	import CancelEmailChangeForm from "./cancel-email-change-form.svelte";
	import { page } from "$app/stores";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Alert from "$lib/components/ui/alert";

	type Props = {
		updateEmailForm: SVUpdateEmail;
		verifyEmailChangeForm: SVVerifyEmailChange;
		pendingEmailChangeVerification: boolean;
		cancelEmailChangeForm: SVCancelEmailChange;
	};

	let { updateEmailForm, verifyEmailChangeForm, cancelEmailChangeForm, ...restProps }: Props =
		$props();

	let updatingEmail = $state(false);
	let pendingEmailChangeVerification = $state(restProps.pendingEmailChangeVerification);
	let newEmailInput = $state<HTMLInputElement | undefined>();

	$effect(() => {
		pendingEmailChangeVerification = restProps.pendingEmailChangeVerification;
	});

	$effect(() => {
		if (updatingEmail) {
			tick().then(() => {
				newEmailInput?.focus();
			});
		}
	});
</script>

<Card.Root class="mx-auto w-full max-w-xl">
	<Card.Header>
		<Card.Title>Email</Card.Title>
		<Card.Description>Update the email address associated with your account.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if pendingEmailChangeVerification}
			<Alert.Root variant="destructive">
				<Alert.Title>Email Change Pending Verification</Alert.Title>
				<Alert.Description>
					Enter the code sent to your email to confirm the change, or cancel the request to keep
					your current email.
				</Alert.Description>
			</Alert.Root>
			<VerifyEmailChangeForm {verifyEmailChangeForm} onConfirm={() => (updatingEmail = false)} />
			<CancelEmailChangeForm
				{cancelEmailChangeForm}
				onCancel={() => (pendingEmailChangeVerification = false)}
			/>
		{:else if updatingEmail}
			<UpdateEmailForm
				{updateEmailForm}
				bind:pendingEmailChangeVerification
				bind:newEmailInput
				onCancel={() => (updatingEmail = false)}
			/>
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
