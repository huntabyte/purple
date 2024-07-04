import type { Lucia } from "lucia";
import { Argon2id } from "oslo/password";
import { isWithinExpirationDate } from "oslo";
import { type UsersRepo, usersRepo } from "../repos/users-repo";
import { lucia } from "../lucia";
import { type AccountsRepo, accountsRepo } from "../repos/accounts-repo";
import { type ProfilesRepo, profilesRepo } from "../repos/profiles-repo";
import { createTransaction } from "../repos/utils";
import type { User } from "../database/tables";

import type { EmailService } from "./email-service";
import { emailService } from "./email-service";

import type { EmailTokenService } from "./email-token-services";
import { emailChangeTokensService, emailVerifyTokensService } from "./email-token-services";
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

type SendVerificationEmailProps = {
	userId: string;
	email: string;
};

type SendEmailChangeRequestEmailProps = {
	userId: string;
	email: string;
};

type RequestEmailChangeProps = {
	userId: string;
	newEmail: string;
};

type AuthServiceDeps = {
	lucia: Lucia;
	usersRepo: UsersRepo;
	accountsRepo: AccountsRepo;
	profilesRepo: ProfilesRepo;
	emailVerifyTokensService: EmailTokenService;
	emailChangeTokensService: EmailTokenService;
	emailService: EmailService;
};

export class AuthService {
	sessionCookieName: string;
	argon = new Argon2id();

	constructor(private readonly deps: AuthServiceDeps) {
		this.sessionCookieName = this.deps.lucia.sessionCookieName;
	}

	/**
	 * Hashes a password using Argon2id.
	 */
	private async hashPassword(password: string) {
		try {
			const hash = await this.argon.hash(password);
			return hash;
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Verifies a password against a hashed password.
	 */
	private async verifyPassword(hashedPassword: string, password: string) {
		try {
			const verify = await this.argon.verify(hashedPassword, password);
			return verify;
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Creates a new session for a user. If a session ID is provided, the session is created with
	 * that ID. If no session ID is provided, a new session ID is generated.
	 */
	async createSession(userId: string, sessionId?: string) {
		try {
			const session = await this.deps.lucia.createSession(userId, { sessionId });
			return session;
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Creates a new session cookie for a session ID.
	 */
	createSessionCookie(sessionId: string) {
		return this.deps.lucia.createSessionCookie(sessionId);
	}

	/**
	 * Creates a new blank session cookie.
	 */
	createBlankSessionCookie() {
		return this.deps.lucia.createBlankSessionCookie();
	}

	/**
	 * Validates a session by its session ID.
	 */
	async validateSession(sessionId: string) {
		try {
			const session = await this.deps.lucia.validateSession(sessionId);
			return session;
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Creates a new session and session cookie for a user. If a session ID is provided, the
	 * session is created with that ID. If no session ID is provided, a new session ID is
	 */
	async createSessionAndCookie(userId: string, sessionId?: string) {
		try {
			const session = await this.createSession(userId, sessionId);
			return this.createSessionCookie(session.id);
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Invalidates all sessions for a user.
	 */
	async invalidateUserSessions(userId: string) {
		try {
			await this.deps.lucia.invalidateUserSessions(userId);
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Invalidates a session by its session ID. A new blank session cookie is returned.
	 */
	private async invalidateSession(sessionId: string) {
		try {
			await this.deps.lucia.invalidateSession(sessionId);
			return this.createBlankSessionCookie();
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Logs out a user by invalidating their session. A new blank session cookie is returned.
	 * This method does not invalidate any other sessions the user may have.
	 */
	async logout(sessionId: string) {
		try {
			await this.invalidateSession(sessionId);
			return this.createBlankSessionCookie();
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Logs out a user by invalidating all of their sessions. A new blank session cookie is
	 * returned to be applied to the response.
	 */
	async logoutAll(userId: string) {
		try {
			await this.invalidateUserSessions(userId);
			return this.createBlankSessionCookie();
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Logs in a user by verifying their email and password. If successful, a session cookie is
	 * created and returned.
	 */
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

	/**
	 * Registers a new user by creating a new user, account, and profile record. A verification
	 * email is sent to the user's email address to verify their email.
	 */
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

			await this.sendVerificationEmail({
				userId: user.id,
				email: user.email,
			});

			return await this.createSessionAndCookie(user.id);
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Verifies a user's request to change their email address. If successful, the user's email
	 * address is updated, their email is marked as verified, and any existing sessions are
	 * invalidated. A new session cookie is created and returned.
	 */
	async verifyChangeEmailToken({ user, token }: VerifyEmailChangeTokenProps) {
		try {
			const tokenRecord = await this.deps.emailChangeTokensService.getTokenByUserId(user.id);

			if (!tokenRecord || !isWithinExpirationDate(new Date(tokenRecord.expiresAt))) {
				throw new CustomError("TOKEN_EXPIRED");
			}
			if (tokenRecord.token !== token) {
				throw new CustomError("TOKEN_INVALID");
			}

			await createTransaction(async (tx) => {
				await this.deps.emailChangeTokensService.revokeTokenByUserId({ userId: user.id }, tx);
				await this.deps.usersRepo.updateEmailVerificationStatus({
					userId: user.id,
					email: tokenRecord.email,
					emailVerified: true,
				});
			});

			// Send a courtesy email to the original email address to notify them of the change.
			await this.deps.emailService.sendEmailChangeNotificationEmail({
				originalEmail: user.email,
				newEmail: tokenRecord.email,
			});

			await this.invalidateUserSessions(user.id);
			return await this.createSessionAndCookie(user.id);
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Verifies a user's initial email address. If successful, the user's email is marked
	 * as verified, and any existing sessions are invalidated. A new session cookie is
	 * created and returned.
	 */
	async verifyEmailToken({ user, email, token }: VerifyEmailTokenProps) {
		try {
			const tokenRecord = await this.deps.emailVerifyTokensService.getTokenByUserId(user.id);

			if (!tokenRecord || !isWithinExpirationDate(new Date(tokenRecord.expiresAt))) {
				throw new CustomError("TOKEN_EXPIRED");
			}

			if (tokenRecord.token !== token) {
				throw new CustomError("TOKEN_INVALID");
			}
			await createTransaction(async (tx) => {
				await this.deps.emailVerifyTokensService.revokeTokenByUserId({ userId: user.id }, tx);
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

	/**
	 * Sends a verification email to the email address the user is attempting to change to.
	 * This is used to verify the new email address when a user requests to change their email.
	 */
	private async sendEmailChangeRequestEmail(props: SendEmailChangeRequestEmailProps) {
		try {
			const { token } = await this.deps.emailChangeTokensService.issueToken(props);
			await this.deps.emailService.sendEmailChangeRequestEmail({
				newEmail: props.email,
				token,
			});
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Sends a verification email to the email address the user registered their account with.
	 */
	async sendVerificationEmail(props: SendVerificationEmailProps) {
		try {
			const { token } = await this.deps.emailVerifyTokensService.issueToken(props);
			await this.deps.emailService.sendEmailVerificationEmail({
				email: props.email,
				token,
			});
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Handles a user's request to change their email address. This method sends a verification
	 * email to the new email address and revokes any existing email change tokens for the user.
	 * The user's email address is not updated until the email change token is verified.
	 * This method does not invalidate any existing sessions.
	 */
	async requestEmailChange({ newEmail, userId }: RequestEmailChangeProps) {
		try {
			const emailExists = await this.deps.usersRepo.getByEmail(newEmail);
			if (emailExists) throw new CustomError("USER_ALREADY_EXISTS");
			await this.sendEmailChangeRequestEmail({ userId, email: newEmail });
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
	emailChangeTokensService,
	emailVerifyTokensService,
	emailService,
});
