<script lang="ts">
	import '../app.pcss';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';

	let { data } = $props();

	// eslint-disable-next-line svelte/valid-compile
	$page;
</script>

<div class="mx-auto w-full max-w-xl">
	<pre>User: {JSON.stringify(data.user, null, 2)}</pre>
	<pre>Session: {JSON.stringify(data.session, null, 2)}</pre>
	<div class="flex items-center justify-between">
		<div class="flex max-w-xl items-center gap-4 py-8">
			<Button href="/login" variant={$page.url.pathname.includes('login') ? 'outline' : 'ghost'}
				>Login</Button
			>
			<Button
				href="/register"
				variant={$page.url.pathname.includes('register') ? 'outline' : 'ghost'}>Register</Button
			>
		</div>
		<form action="/logout" method="POST">
			<Button type="submit">Logout</Button>
		</form>
	</div>
</div>
<slot />
