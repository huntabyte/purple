<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import type { PageData } from "./$types.js";
	import UpdatePostForm from "$lib/components/update-post-form.svelte";

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
			<UpdatePostForm form={data.updatePostForm} post={data.post} />
		</Card.Content>
	</Card.Root>
</div>
