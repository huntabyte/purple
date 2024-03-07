<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { PostWithUser } from '$lib/server/schemas';

	type Props = {
		post: PostWithUser;
	};

	let { post } = $props<Props>();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>
			{post.title}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{post.content}
	</Card.Content>
	<Card.Footer>
		By: {post.user.username}
	</Card.Footer>
</Card.Root>
