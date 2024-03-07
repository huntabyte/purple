<script lang="ts">
	import { CreatePostDialog } from '$lib/components';

	let { data } = $props();
</script>

<div class="container max-w-xl">
	{#if data.session}
		<CreatePostDialog form={data.createPostForm} />
	{:else}
		<p>
			You need to be logged in to create a post <a href="/login" class="underline">Login now</a>
		</p>
	{/if}

	<pre>{JSON.stringify(data.posts, null, 2)}</pre>
</div>
