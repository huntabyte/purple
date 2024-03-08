<script lang="ts">
	import "../app.pcss";
	import { Toaster } from "$lib/components/ui/sonner";

	let { children } = $props();
</script>

<Toaster />

{@render children()}
