<script lang="ts">
	import type { Comment } from "$lib/server/schemas";

	type Props = {
		comment: {
			id: string;
		};
	};

	let { comment } = $props<Props>();
</script>

<div class="flex items-center"></div>
