<script lang="ts">
	import { PostCreateForm, PostCard } from "$lib/components";

	let { data } = $props();
</script>

{#if data.session}
	<PostCreateForm createPostForm={data.createPostForm} />
{:else}
	<p>
		You need to be logged in to create a post <a href="/login" class="underline">Login now</a>
	</p>
{/if}
<div class="mt-4 flex flex-col gap-6">
	{#each data.posts as post (post.id)}
		<PostCard
			{post}
			updatePostForm={data.updatePostForm}
			deletePostForm={data.deletePostForm}
			createCommentForm={data.createCommentForm}
			createLikeForm={data.createLikeForm}
			deleteLikeForm={data.deleteLikeForm}
		/>
	{/each}
</div>
