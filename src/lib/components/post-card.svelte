<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import type { PostWithRelations } from "$lib/server/schemas";
	import { Button } from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import MoreVertical from "lucide-svelte/icons/more-vertical";
	import Trash from "lucide-svelte/icons/trash";
	import SquarePen from "lucide-svelte/icons/square-pen";
	import MessageCircle from "lucide-svelte/icons/message-circle";
	import { buttonVariants } from "./ui/button";
	import type { SuperValidated, Infer } from "sveltekit-superforms";
	import {
		createLikeSchema,
		createPostCommentSchema,
		deleteLikeSchema,
		deletePostSchema,
		updatePostSchema,
	} from "$lib/zod-schemas";
	import { sleep } from "$lib/utils";
	import { setPostState } from "$lib/state.svelte";
	import { page } from "$app/stores";
	import PostCommentForm from "./post-comment-form.svelte";
	import PostUpdateDialog from "./post-update-dialog.svelte";
	import PostDeleteDialog from "./post-delete-dialog.svelte";
	import PostLikeForm from "./post-like-form.svelte";

	type Props = {
		post: PostWithRelations & { userLiked: number };
		deletePostForm: SuperValidated<Infer<typeof deletePostSchema>>;
		updatePostForm: SuperValidated<Infer<typeof updatePostSchema>>;
		createCommentForm: SuperValidated<Infer<typeof createPostCommentSchema>>;
		createLikeForm: SuperValidated<Infer<typeof createLikeSchema>>;
		deleteLikeForm: SuperValidated<Infer<typeof deleteLikeSchema>>;
	};

	let {
		post,
		deletePostForm,
		updatePostForm,
		createCommentForm,
		createLikeForm,
		deleteLikeForm,
	}: Props = $props();

	const data = setPostState({
		post,
		deletePostForm,
		updatePostForm,
		createCommentForm,
		createLikeForm,
		deleteLikeForm,
	});

	// eslint-disable-next-line svelte/valid-compile
	$page;
</script>

<div class="flex flex-col rounded-lg border p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Avatar.Root>
				<Avatar.Fallback class="uppercase">
					{post.user.username.slice(0, 2)}
				</Avatar.Fallback>
			</Avatar.Root>
			<span class="text-sm font-medium">{post.user.username}</span>
		</div>
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
	</div>
	<div class="flex flex-col">
		<div>
			<a href="/posts/{post.id}" class="mb-2 text-xl font-medium">{post.title}</a>
			<p>{post.content}</p>
		</div>
		<div class="flex w-full items-center justify-between">
			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					class="gap-1"
					type="button"
					onclick={() => (data.commentOpen = !data.commentOpen)}
				>
					<MessageCircle class="size-4" />
					{post.comments.length}
				</Button>
				<PostLikeForm />
			</div>
			<span>{post.createdAt}</span>
		</div>
		<PostCommentForm />
	</div>
</div>

<PostUpdateDialog />
<PostDeleteDialog />
