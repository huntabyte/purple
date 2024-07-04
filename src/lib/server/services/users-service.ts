import type { AccountsRepo } from "../repos/accounts-repo";
import { accountsRepo } from "../repos/accounts-repo";
import type { ProfilesRepo } from "../repos/profiles-repo";
import { profilesRepo } from "../repos/profiles-repo";
import type { InsertProfile } from "../database/tables";
import { type EmailService, emailService } from "./email-service";
import type { UsersRepo } from "$lib/server/repos/users-repo";
import { usersRepo } from "$lib/server/repos/users-repo";
import { CustomError, handleException } from "$lib/errors";

type UsersServiceDeps = {
	usersRepo: UsersRepo;
	accountsRepo: AccountsRepo;
	profilesRepo: ProfilesRepo;
	emailService: EmailService;
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

	async getProfileByUserId(userId: string) {
		try {
			const profile = await this.deps.profilesRepo.getByUserId(userId);
			if (!profile) throw new CustomError("NOT_FOUND");
			return profile;
		} catch (err) {
			throw handleException(err);
		}
	}

	async updateProfile({ userId, displayName, bio }: InsertProfile) {
		try {
			return await this.deps.profilesRepo.update({ userId, displayName, bio });
		} catch (err) {
			throw handleException(err);
		}
	}
}

export const usersService = new UsersService({
	profilesRepo,
	accountsRepo,
	usersRepo,
	emailService,
});
