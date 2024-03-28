<script lang="ts">
	import { PostCreateDialog, PostCard } from "$lib/components";

	let { data } = $props();
</script>

{#if data.session}
	<PostCreateDialog form={data.createPostForm} />
{:else}
	<p>
		You need to be logged in to create a post <a href="/login" class="underline">Login now</a>
	</p>
{/if}
<div class="flex flex-col gap-4">
	{#each data.posts as post (post.id)}
		<PostCard
			{post}
			updatePostForm={data.updatePostForm}
			deletePostForm={data.deletePostForm}
			createCommentForm={data.createCommentForm}
			createLikeForm={data.createLikeForm}
		/>
	{/each}
</div>
