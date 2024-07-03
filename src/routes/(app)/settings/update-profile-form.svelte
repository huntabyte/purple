<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { type SuperValidatedUpdateProfile, updateProfileSchema } from "./schemas";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Form from "$lib/components/ui/form";

	let { updateProfileForm }: { updateProfileForm: SuperValidatedUpdateProfile } = $props();

	const form = superForm(updateProfileForm, {
		validators: zodClient(updateProfileSchema),
	});
	const { form: formData, enhance } = form;
</script>

<Card.Root class="mx-auto w-full max-w-xl">
	<Card.Header>
		<Card.Title>Profile</Card.Title>
		<Card.Description>Update the information displayed on your profile.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form use:enhance method="POST" action="?/updateProfile" class="flex flex-col gap-3">
			<Form.Field {form} name="displayName">
				<Form.Control let:attrs>
					<Form.Label>Display name</Form.Label>
					<Input {...attrs} bind:value={$formData.displayName} />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="bio">
				<Form.Control let:attrs>
					<Form.Label>Bio</Form.Label>
					<Textarea {...attrs} bind:value={$formData.bio} />
				</Form.Control>
			</Form.Field>
			<Button type="submit" class="mt-2 self-start">Update Profile</Button>
		</form>
	</Card.Content>
</Card.Root>
