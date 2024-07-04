<script lang="ts">
	import UpdateEmailCard from "./update-email-card.svelte";
	import UpdateProfileCard from "./update-profile-card.svelte";

	let { data } = $props();
</script>

<div class="flex flex-col gap-8">
	<UpdateProfileCard updateProfileForm={data.updateProfileForm} />
	<UpdateEmailCard
		cancelEmailChangeForm={data.cancelEmailChangeForm}
		pendingEmailChangeVerification={data.pendingEmailChangeVerification}
		updateEmailForm={data.updateEmailForm}
		verifyEmailChangeForm={data.verifyEmailChangeForm}
	/>
</div>
