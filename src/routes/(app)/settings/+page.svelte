<script lang="ts">
	import UpdateProfileForm from "./update-profile-form.svelte";
	
let { data } = $props();

</script>

<div class="flex flex-col">
	<UpdateProfileForm updateProfileForm={data.updateProfileForm} />
</div>
