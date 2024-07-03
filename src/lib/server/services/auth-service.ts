import type { Lucia } from "lucia";
import { Argon2id } from "oslo/password";
import { isWithinExpirationDate } from "oslo";
import { type UsersRepo, usersRepo } from "../repos/users-repo";
import { lucia } from "../lucia";
import { type AccountsRepo, accountsRepo } from "../repos/accounts-repo";
import { type ProfilesRepo, profilesRepo } from "../repos/profiles-repo";
import {
	type EmailVerificationTokensRepo,
	emailVerificationTokensRepo,
} from "../repos/email-verification-tokens-repo";
import { createTransaction } from "../repos/utils";
import type { User } from "../database/tables";
import {
	type EmailChangeRequestTokensRepo,
	emailChangeRequestTokensRepo,
} from "../repos/email-change-request-tokens-repo";
import type { EmailService } from "./email-service";
import { emailService } from "./email-service";
import { CustomError, handleException } from "$lib/errors";

type RegisterUserProps = {
	email: string;
	password: string;
};

type LoginUserProps = {
	email: string;
	password: string;
};

type VerifyEmailTokenProps = {
	user: User;
	email: string;
	token: string;
};

type VerifyEmailChangeTokenProps = {
	user: User;
	token: string;
};

type AuthServiceDeps = {
	lucia: Lucia;
	usersRepo: UsersRepo;
	accountsRepo: AccountsRepo;
	profilesRepo: ProfilesRepo;
	emailVerificationTokensRepo: EmailVerificationTokensRepo;
	emailChangeRequestTokensRepo: EmailChangeRequestTokensRepo;
	emailService: EmailService;
};

export class AuthService {
	sessionCookieName: string;
	argon = new Argon2id();

	constructor(private readonly deps: AuthServiceDeps) {
		this.sessionCookieName = this.deps.lucia.sessionCookieName;
	}

	private async hashPassword(password: string) {
		try {
			const hash = await this.argon.hash(password);
			return hash;
		} catch (err) {
			throw handleException(err);
		}
	}

	private async verifyPassword(hashedPassword: string, password: string) {
		try {
			const verify = await this.argon.verify(hashedPassword, password);
			return verify;
		} catch (err) {
			throw handleException(err);
		}
	}

	async createSession(userId: string, sessionId?: string) {
		try {
			const session = await this.deps.lucia.createSession(userId, { sessionId });
			return session;
		} catch (err) {
			throw handleException(err);
		}
	}

	createSessionCookie(sessionId: string) {
		return this.deps.lucia.createSessionCookie(sessionId);
	}

	createBlankSessionCookie() {
		return this.deps.lucia.createBlankSessionCookie();
	}

	async validateSession(sessionId: string) {
		try {
			const session = await this.deps.lucia.validateSession(sessionId);
			return session;
		} catch (err) {
			throw handleException(err);
		}
	}

	async createSessionAndCookie(userId: string, sessionId?: string) {
		try {
			const session = await this.createSession(userId, sessionId);
			return this.createSessionCookie(session.id);
		} catch (err) {
			throw handleException(err);
		}
	}

	async invalidateUserSessions(userId: string) {
		try {
			await this.deps.lucia.invalidateUserSessions(userId);
		} catch (err) {
			throw handleException(err);
		}
	}

	private async invalidateSession(sessionId: string) {
		try {
			await this.deps.lucia.invalidateSession(sessionId);
			return this.createBlankSessionCookie();
		} catch (err) {
			throw handleException(err);
		}
	}

	async logout(sessionId: string) {
		try {
			await this.invalidateSession(sessionId);
			return this.createBlankSessionCookie();
		} catch (err) {
			throw handleException(err);
		}
	}

	async login(props: LoginUserProps) {
		try {
			const user = await this.deps.usersRepo.getByEmail(props.email);
			if (!user) throw new CustomError("INVALID_CREDENTIALS");

			const account = await this.deps.accountsRepo.getByUserId(user.id);
			if (!account) throw new CustomError("INTERNAL_ERROR");

			const validPassword = await this.verifyPassword(account.hashedPassword, props.password);
			if (!validPassword) throw new CustomError("INVALID_CREDENTIALS");

			const sessionCookie = await this.createSessionAndCookie(user.id);
			return sessionCookie;
		} catch (err) {
			throw handleException(err);
		}
	}

	async register(props: RegisterUserProps) {
		try {
			const userExists = await this.deps.usersRepo.getByEmail(props.email);
			if (userExists) throw new CustomError("USER_ALREADY_EXISTS");

			const hashedPassword = await this.hashPassword(props.password);

			await createTransaction(async (tx) => {
				const createdUser = await this.deps.usersRepo.create(props.email, tx);
				await this.deps.accountsRepo.create({ userId: createdUser.id, hashedPassword }, tx);
				await this.deps.profilesRepo.create({ userId: createdUser.id }, tx);
			});

			const user = await this.deps.usersRepo.getByEmail(props.email);
			if (!user) throw new CustomError("CREATE_USER_ERROR");

			await this.sendVerificationEmail(user.id, props.email);
			return await this.createSessionAndCookie(user.id);
		} catch (err) {
			throw handleException(err);
		}
	}

	async verifyChangeEmailToken({ user, token }: VerifyEmailChangeTokenProps) {
		try {
			const tokenRecord = await this.deps.emailChangeRequestTokensRepo.getByUserId(user.id);

			if (!tokenRecord || !isWithinExpirationDate(new Date(tokenRecord.expiresAt))) {
				throw new CustomError("TOKEN_EXPIRED");
			}
			if (tokenRecord.token !== token) {
				throw new CustomError("TOKEN_INVALID");
			}

			await createTransaction(async (tx) => {
				await this.deps.emailChangeRequestTokensRepo.deleteByUserId(user.id, tx);
				await this.deps.usersRepo.updateEmailVerificationStatus({
					userId: user.id,
					email: tokenRecord.newEmail,
					emailVerified: true,
				});
			});
		} catch (err) {
			throw handleException(err);
		}
	}

	async verifyEmailToken({ user, email, token }: VerifyEmailTokenProps) {
		try {
			const tokenRecord = await this.deps.emailVerificationTokensRepo.getByUserId(user.id);

			if (!tokenRecord || !isWithinExpirationDate(new Date(tokenRecord.expiresAt))) {
				throw new CustomError("TOKEN_EXPIRED");
			}

			if (tokenRecord.token !== token) {
				throw new CustomError("TOKEN_INVALID");
			}
			await createTransaction(async (tx) => {
				await this.deps.emailVerificationTokensRepo.deleteByUserId(user.id, tx);
				await this.deps.usersRepo.updateEmailVerificationStatus(
					{ email, userId: user.id, emailVerified: true },
					tx
				);
			});

			await this.invalidateUserSessions(user.id);
			return await this.createSessionAndCookie(user.id);
		} catch (err) {
			throw handleException(err);
		}
	}

	async sendEmailChangeRequestEmail(userId: string, newEmail: string) {
		try {
			const { token } = await this.deps.emailChangeRequestTokensRepo.create({
				userId,
				newEmail,
			});
			await this.deps.emailService.sendEmailChangeRequestEmail({
				newEmail,
				token,
			});
		} catch (err) {
			throw handleException(err);
		}
	}

	async sendVerificationEmail(userId: string, email: string) {
		try {
			const { token } = await this.deps.emailVerificationTokensRepo.create({
				userId,
				email,
			});
			await this.deps.emailService.sendEmailVerificationEmail({
				email,
				token,
			});
		} catch (err) {
			throw handleException(err);
		}
	}
}

export const authService = new AuthService({
	lucia,
	usersRepo,
	accountsRepo,
	profilesRepo,
	emailVerificationTokensRepo,
	emailChangeRequestTokensRepo,
	emailService,
});
