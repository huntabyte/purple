import type { AccountsRepo } from "../repos/accounts-repo";
import { accountsRepo } from "../repos/accounts-repo";
import type { ProfilesRepo } from "../repos/profiles-repo";
import { profilesRepo } from "../repos/profiles-repo";
import type { EmailVerificationTokensRepo } from "../repos/email-verification-tokens-repo";
import { emailVerificationTokensRepo } from "../repos/email-verification-tokens-repo";
import { sendEmail } from "../email";
import type { User } from "../database/tables";
import type { UsersRepo } from "$lib/server/repos/users-repo";
import { usersRepo } from "$lib/server/repos/users-repo";
import { handleException } from "$lib/errors";

type UsersServiceDeps = {
	usersRepo: UsersRepo;
	emailVerificationTokensRepo: EmailVerificationTokensRepo;
	accountsRepo: AccountsRepo;
	profilesRepo: ProfilesRepo;
};

class UsersService {
	constructor(private deps: UsersServiceDeps) {}

	async getByEmail(email: string) {
		try {
			const user = await this.deps.usersRepo.getByEmail(email);
			return user;
		} catch (err) {
			throw handleException(err);
		}
	}
}

export const usersService = new UsersService({
	profilesRepo,
	accountsRepo,
	usersRepo,
	emailVerificationTokensRepo,
});
