<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import MoreVertical from "lucide-svelte/icons/more-vertical";
	import MessageCircle from "lucide-svelte/icons/message-circle";
	import Heart from "lucide-svelte/icons/heart";
	let { data } = $props();
</script>

<div class="flex flex-col gap-4 py-8">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Avatar.Root>
				<Avatar.Fallback class="uppercase">
					{data.post.user.username.slice(0, 2)}
				</Avatar.Fallback>
			</Avatar.Root>
			<span class="text-sm font-medium">{data.post.user.username}</span>
		</div>
		<Button variant="ghost" size="icon">
			<MoreVertical class="size-4" />
			<span class="sr-only">Post Options</span>
		</Button>
	</div>
	<div class="flex flex-col">
		<div>
			<h1 class="mb-2 text-2xl font-medium">{data.post.title}</h1>
			<p>{data.post.content}</p>
		</div>
		<div class="flex w-full items-center gap-1">
			<Button variant="ghost" size="icon" class="gap-1">
				<MessageCircle class="size-4" />
				{data.post.comments.length}
			</Button>
			<Button variant="ghost" size="icon" class="gap-1">
				<Heart class="size-4" />
				{data.post.likes.length}
			</Button>
		</div>
	</div>

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
