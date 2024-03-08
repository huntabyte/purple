<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import type { PageData } from "./$types.js";
	import PostUpdateForm from "$lib/components/post-update-form.svelte";

	type Props = {
		data: PageData;
	};

	let { data } = $props<Props>();
</script>

<div class="container mx-auto max-w-xl">
	<Card.Root>
		<Card.Header>
			<Card.Title>Update post</Card.Title>
		</Card.Header>
		<Card.Content>
			<PostUpdateForm form={data.updatePostForm} post={data.post} open={{ value: false }} />
		</Card.Content>
	</Card.Root>
</div>
