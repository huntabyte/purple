<script lang="ts">
	import type { User } from "$lib/server/database/tables";

	type Props = {
		user: User | null;
	};

	let { user }: Props = $props();
</script>

{#if user && !user.emailVerified}
	<div class="w-full bg-foreground">
		<div class="container mx-auto py-1.5">
			<p class="text-center text-sm text-background">
				Please
				<a href="/verify-email" class="font-medium underline">verify your email</a>
				address to access all features of the app.
			</p>
		</div>
	</div>
{/if}
