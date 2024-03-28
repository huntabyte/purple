<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import PostUpdateForm from "$lib/components/post-update-form.svelte";
</script>

<div class="container mx-auto max-w-xl">
	<Card.Root>
		<Card.Header>
			<Card.Title>Update post</Card.Title>
		</Card.Header>
		<Card.Content>
			<PostUpdateForm />
		</Card.Content>
	</Card.Root>
</div>
