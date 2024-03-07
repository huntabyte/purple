<script lang="ts">
	let { errors = [] } = $props<{ errors?: string[] }>();
</script>

<div class="text-destructive" aria-live="assertive">
	{#if errors.length}
		{#each errors as err}
			<p>{err}</p>
		{/each}
	{/if}
</div>
