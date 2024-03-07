<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { PostWithUser } from '$lib/server/schemas';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import MoreVertical from 'lucide-svelte/icons/more-vertical';
	import Trash from 'lucide-svelte/icons/trash';
	import SquarePen from 'lucide-svelte/icons/square-pen';
	import { buttonVariants } from './ui/button';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { deletePostSchema } from '$lib/zod-schemas';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { sleep } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';

	type Props = {
		post: PostWithUser;
		form: SuperValidated<Infer<typeof deletePostSchema>>;
	};

	let { post, form: theForm } = $props<Props>();

	const form = superForm(theForm, {
		validators: zodClient(deletePostSchema),
		onUpdated: ({ form: returnForm }) => {
			if (!returnForm.valid) return toast.error('Error deleting your post!');
			openStates.deleteDialogOpen = false;
			toast.success('Post deleted!');
		}
	});

	const { enhance } = form;

	const openStates = $state({
		deleteDialogOpen: false,
		editDialogOpen: false,
		dropdownOpen: false
	});

	// eslint-disable-next-line svelte/valid-compile
	$page;
</script>

<Card.Root>
	<Card.Header class="flex-row items-center justify-between">
		<Card.Title>
			{post.title}
		</Card.Title>
		{#if $page.data.user && $page.data.user.id === post.userId}
			<DropdownMenu.Root bind:open={openStates.dropdownOpen}>
				<DropdownMenu.Trigger class={buttonVariants({ size: 'icon', variant: 'ghost' })}>
					<MoreVertical class="size-4" />
					<span class="sr-only">Post options</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item>
						<SquarePen class="mr-2 size-4" />
						Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item
						on:click={(e) => {
							e.preventDefault();
							openStates.dropdownOpen = false;
							sleep(2).then(() => {
								openStates.deleteDialogOpen = true;
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
	<Card.Footer>
		By: {post.user.username}
	</Card.Footer>
</Card.Root>

<AlertDialog.Root bind:open={openStates.deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Post</AlertDialog.Title>
			<AlertDialog.Description>Are you sure you want to delete this post?</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form use:enhance method="POST" action="?/deletePost&id={post.id}">
				<Button class={buttonVariants({ variant: 'destructive' })} type="submit"
					>Yes, delete.</Button
				>
			</form>
			<AlertDialog.Cancel
				class={buttonVariants({ variant: 'outline' })}
				onclick={() => (openStates.deleteDialogOpen = false)}>No, cancel.</AlertDialog.Cancel
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
