import { db } from '$lib/server/db';
import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { createPostSchema } from '$lib/zod-schemas';
import { fail, redirect } from '@sveltejs/kit';
import { posts } from '$lib/server/schemas';
import { generateId } from 'lucia';

export const load: PageServerLoad = async () => {
	const createPostForm = await superValidate(zod(createPostSchema));

	const posts = await db.query.posts.findMany({});

	return {
		posts,
		createPostForm
	};
};

export const actions: Actions = {
	createPost: async (event) => {
		if (!event.locals.user) redirect(302, '/login');
		const form = await superValidate(event, zod(createPostSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const postId = generateId(15);

		// create post in db
		await db.insert(posts).values({ id: postId, ...form.data, userId: event.locals.user.id });

		return { form };
	}
};
