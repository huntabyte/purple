<script lang="ts">
	let { children } = $props();
</script>

<div class="flex flex-col gap-3 py-12 text-center">
	<h1 class="text-4xl font-medium">Settings</h1>
	<p class="text-lg text-muted-foreground">Manage your account, profile, preferences, and more</p>
</div>
<div class="flex-1">
	{@render children?.()}
</div>
