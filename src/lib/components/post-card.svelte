<script lang="ts" context="module">
</script>

<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import type { PostWithUser } from "$lib/server/schemas";
	import { Button } from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import MoreVertical from "lucide-svelte/icons/more-vertical";
	import Trash from "lucide-svelte/icons/trash";
	import SquarePen from "lucide-svelte/icons/square-pen";
	import { buttonVariants } from "./ui/button";
	import SuperDebug, { type SuperValidated, type Infer } from "sveltekit-superforms";
	import { createPostCommentSchema, deletePostSchema, updatePostSchema } from "$lib/zod-schemas";
	import { sleep } from "$lib/utils";
	import { setPostState } from "$lib/state.svelte";
	import { page } from "$app/stores";
	import PostCommentForm from "./post-comment-form.svelte";
	import PostUpdateDialog from "./post-update-dialog.svelte";
	import PostDeleteDialog from "./post-delete-dialog.svelte";

	type Props = {
		post: PostWithUser;
		deletePostForm: SuperValidated<Infer<typeof deletePostSchema>>;
		updatePostForm: SuperValidated<Infer<typeof updatePostSchema>>;
		createCommentForm: SuperValidated<Infer<typeof createPostCommentSchema>>;
	};

	let { post, deletePostForm, updatePostForm, createCommentForm } = $props<Props>();

	const data = setPostState({ post, deletePostForm, updatePostForm, createCommentForm });

	// eslint-disable-next-line svelte/valid-compile
	$page;
</script>

<SuperDebug data={post} />

<Card.Root>
	<Card.Header class="flex-row items-center justify-between">
		<Card.Title>
			{post.title}
		</Card.Title>
		{#if $page.data.user && $page.data.user.id === post.userId}
			<DropdownMenu.Root bind:open={data.dropdownOpen}>
				<DropdownMenu.Trigger class={buttonVariants({ size: "icon", variant: "ghost" })}>
					<MoreVertical class="size-4" />
					<span class="sr-only">Post options</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item
						on:click={(e) => {
							e.preventDefault();
							data.dropdownOpen = false;
							sleep(2).then(() => {
								data.updateOpen = true;
							});
						}}
					>
						<SquarePen class="mr-2 size-4" />
						Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item
						on:click={(e) => {
							e.preventDefault();
							data.dropdownOpen = false;
							sleep(2).then(() => {
								data.deleteOpen = true;
							});
						}}
					>
						<Trash class="mr-2 size-4" />
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</Card.Header>
	<Card.Content>
		{post.content}
	</Card.Content>
	<Card.Footer class="flex flex-col items-start gap-4">
		<div class="flex w-full items-center justify-between">
			<div>
				By: {post.user.username}
			</div>
			<div>
				{post.createdAt}
			</div>
		</div>
		{#if $page.data.user && $page.data.user.id !== post.userId}
			<div class="flex items-center gap-4">
				<Button size="sm" onclick={() => (data.commentOpen = true)}>Comment</Button>
			</div>
			<PostCommentForm />
		{/if}
	</Card.Footer>
</Card.Root>

<PostUpdateDialog />
<PostDeleteDialog />
