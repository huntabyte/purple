<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import type { Snippet } from "svelte";

	type Props = {
		children: Snippet;
		type: "login" | "register";
	};

	let { type, children }: Props = $props();

	type Link = {
		text: string;
		href: string;
	};

	const altLink: Link = $derived(
		type === "register"
			? { href: "/login", text: "Login" }
			: { href: "/register", text: "Register" }
	);
</script>

<div
	class="container relative h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
>
	<Button href={altLink.href} variant="ghost" class="absolute right-4 top-4 md:right-8 md:top-8">
		{altLink.text}
	</Button>
	<div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
		<div
			class="absolute inset-0 bg-cover"
			style="
				background-image:
					url(https://images.unsplash.com/photo-1534515538060-80212d73acb6?q=80&auto=format&fit=crop&w=1376&q=80);"
		></div>
		<div class="relative z-20 flex items-center text-lg font-medium">
			<a href="/" class="underline-offset-4 hover:underline"> Purple </a>
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					"This library has saved me countless hours of work and helped me deliver stunning designs
					to my clients faster than ever before. Highly recommended!"
				</p>
				<footer class="text-sm">Sofia Davis</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			{@render children()}
		</div>
	</div>
</div>
