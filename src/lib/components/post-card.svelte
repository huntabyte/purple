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

	type Props = {
		post: PostWithUser;
	};

	let { post } = $props<Props>();

	let deleteDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let dropdownOpen = $state(false);

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
</script>

<Card.Root>
	<Card.Header class="flex-row items-center justify-between">
		<Card.Title>
			{post.title}
		</Card.Title>
		<DropdownMenu.Root bind:open={dropdownOpen}>
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
						dropdownOpen = false;
						sleep(2).then(() => {
							deleteDialogOpen = true;
						});
					}}
				>
					<Trash class="mr-2 size-4" />
					Delete
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Card.Header>
	<Card.Content>
		{post.content}
	</Card.Content>
	<Card.Footer>
		By: {post.user.username}
	</Card.Footer>
</Card.Root>

<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Post</AlertDialog.Title>
			<AlertDialog.Description>Are you sure you want to delete this post?</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<Button class={buttonVariants({ variant: 'destructive' })}>Yes, delete.</Button>
			<AlertDialog.Cancel
				class={buttonVariants({ variant: 'outline' })}
				onclick={() => (deleteDialogOpen = false)}>No, cancel.</AlertDialog.Cancel
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
