<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import MoreVertical from "lucide-svelte/icons/more-vertical";
	import PostCard from "$lib/components/post-card.svelte";
	let { data } = $props();
</script>

<div class="flex flex-col gap-4 py-8">
	<PostCard {...data} />

	{#each data.post.comments as comment}
		<div class="flex flex-col gap-2 border p-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Avatar.Root>
						<Avatar.Fallback class="uppercase">
							{comment.user.username.slice(0, 2)}
						</Avatar.Fallback>
					</Avatar.Root>
					<span class="text-sm font-medium">{comment.user.username}</span>
				</div>
				<Button variant="ghost" size="icon">
					<MoreVertical class="size-4" />
					<span class="sr-only">Comment Options</span>
				</Button>
			</div>
			<div class="flex flex-col">
				<div>
					<p>{comment.content}</p>
				</div>
			</div>
		</div>
	{/each}
</div>
