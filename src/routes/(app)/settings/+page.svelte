<script lang="ts">
	import EmailSettingsCard from "./(components)/email-settings-card.svelte";
	import PasswordSettingsCard from "./(components)/password-settings-card.svelte";
	import ProfileSettingsCard from "./(components)/profile-settings-card.svelte";

	let { data } = $props();
</script>

<div class="flex flex-col gap-8">
	<ProfileSettingsCard updateProfileForm={data.updateProfileForm} />
	<EmailSettingsCard
		cancelEmailChangeForm={data.cancelEmailChangeForm}
		pendingEmailChangeVerification={data.pendingEmailChangeVerification}
		updateEmailForm={data.updateEmailForm}
		verifyEmailChangeForm={data.verifyEmailChangeForm}
	/>
	<PasswordSettingsCard updatePasswordForm={data.updatePasswordForm} />
</div>
