<script lang="ts">
	let { data } = $props();
</script>

{#if data.user}
	Welcome back, {data.user.email}!
{/if}
