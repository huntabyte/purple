<script lang="ts">
	import { CreatePostDialog, PostCard } from '$lib/components';

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
	<div class="flex flex-col gap-4">
		{#each data.posts as post (post.id)}
			<PostCard {post} form={data.deletePostForm} />
		{/each}
	</div>
</div>
