import { hashPassword } from "../hash";
import { createTransaction } from "../repos/utils";
import type { AccountsRepo } from "../repos/accounts";
import { accountsRepo } from "../repos/accounts";
import type { ProfilesRepo } from "../repos/profiles";
import { profilesRepo } from "../repos/profiles";
import type { EmailVerificationTokensRepo } from "../repos/email-verification-tokens";
import { emailVerificationTokensRepo } from "../repos/email-verification-tokens";
import type { User } from "../database/tables";
import { sendEmail } from "../email";
import { type UsersRepo, usersRepo } from "$lib/server/repos/users";

type RegisterUserProps = {
	email: string;
	password: string;
};

type UserServiceRepos = {
	users: UsersRepo;
	accounts: AccountsRepo;
	emailVerificationTokens: EmailVerificationTokensRepo;
	profiles: ProfilesRepo;
};

class UsersService {
	constructor(private readonly repos: UserServiceRepos) {}

	async getByEmail(email: string) {
		return this.repos.users.getByEmail(email);
	}

	async sendVerificationEmail(email: string) {
		const user = this.repos.users.getByEmail(email);
		if (!user) throw new Error("User not found");
		const { token } = this.repos.emailVerificationTokens.create({
			userId: user.id,
			email: user.email,
		});

		await sendEmail({
			to: user.email,
			subject: "Verify your email",
			text: `Your verification token is: ${token}`,
			html: `Your verification token is: <b>${token}</b>`,
		});
	}

	async registerUser(props: RegisterUserProps) {
		const hashedPassword = await hashPassword(props.password);

		await createTransaction(async (tx) => {
			const createdUser = this.repos.users.create(props.email, tx);
			this.repos.accounts.create({ userId: createdUser.id, hashedPassword }, tx);
			this.repos.profiles.create({ userId: createdUser.id }, tx);
		});

		await this.sendVerificationEmail(props.email);
	}
}

export const usersService = new UsersService({
	users: usersRepo,
	accounts: accountsRepo,
	emailVerificationTokens: emailVerificationTokensRepo,
	profiles: profilesRepo,
});
