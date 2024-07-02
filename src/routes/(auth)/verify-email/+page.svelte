<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { verifyEmailTokenSchema } from "$lib/zod-schemas.js";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "$lib/components/ui/input";

	let { data } = $props();

	const verifyForm = superForm(data.verifyForm, {
		validators: zodClient(verifyEmailTokenSchema),
	});

	const newForm = superForm(data.newForm);

	const { form: formData, enhance: verifyEnhance, message: verifyMessage } = verifyForm;
	const { enhance: newEnhance } = newForm;
</script>

<div
	class="container relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
>
	<div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
		<div
			class="absolute inset-0 bg-cover"
			style="
				background-image:
					url(https://images.unsplash.com/photo-1534515538060-80212d73acb6?q=80&auto=format&fit=crop&w=1376&q=80);"
		></div>
		<div class="relative z-20 flex items-center text-lg font-medium">
			<a href="/" class="underline-offset-4 hover:underline"> Purple </a>
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					"This library has saved me countless hours of work and helped me deliver stunning designs
					to my clients faster than ever before. Highly recommended!"
				</p>
				<footer class="text-sm">Sofia Davis</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Verify your email</h1>
				<p class="text-sm text-muted-foreground">
					You'll need to verify your email before you can create or interact with posts. Check your
					email for the verification token.
				</p>
			</div>

			{#if String($verifyMessage) === "EXPIRED"}
				<form method="POST" action="?/newToken" use:newEnhance class="w-full space-y-4">
					<p>Your token has expired.</p>
					<Form.Button class="w-full">Request new token</Form.Button>
				</form>
			{:else}
				<form method="POST" action="?/verifyToken" use:verifyEnhance class="w-full space-y-4">
					<Form.Field form={verifyForm} name="token">
						<Form.Control let:attrs>
							<Form.Label>Token</Form.Label>
							<Input {...attrs} bind:value={$formData.token} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Button class="w-full">Verify email</Form.Button>
				</form>
			{/if}
		</div>
	</div>
</div>
