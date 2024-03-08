<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { buttonVariants } from "./ui/button";
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants()}>Create Post</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new post</Dialog.Title>
			<Dialog.Description>Start interacting with the community.</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
