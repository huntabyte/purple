<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { toast } from "svelte-sonner";
	import type { SVCancelEmailChange } from "../schemas";
	import { page } from "$app/stores";
	import { Button } from "$lib/components/ui/button";

	type Props = {
		cancelEmailChangeForm: SVCancelEmailChange;
		onCancel: () => void;
	};

	let { cancelEmailChangeForm, onCancel }: Props = $props();

	const form = superForm(cancelEmailChangeForm, {
		onUpdate: ({ result, form }) => {
			if (result.type === "success") {
				if (form.message) {
					toast.success(form.message.text);
					onCancel();
				}
			} else {
				if (form.message) {
					toast.error(form.message.text);
				}
			}
		},
	});
	const { enhance } = form;
</script>

<form
	use:enhance
	method="POST"
	action="?/cancelEmailChangeRequest&userId={$page.data.session?.userId}"
	class="mt-2"
>
	<Button variant="destructive" type="submit">Cancel Email Change</Button>
</form>
