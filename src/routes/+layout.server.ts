import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	return {
		session: event.locals.session,
		user: event.locals.user
	};
};
