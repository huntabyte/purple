<script lang="ts">
	import UpdateEmailForm from "./update-email-form.svelte";
	import UpdateProfileForm from "./update-profile-form.svelte";

	let { data } = $props();
</script>

<div class="flex flex-col gap-8">
	<UpdateProfileForm updateProfileForm={data.updateProfileForm} />
	<UpdateEmailForm updateEmailForm={data.updateEmailForm} />
</div>
