import { TimeSpan, createDate } from "oslo";
import { generateRandomString } from "oslo/crypto";
import {
	type EmailTokenRepo,
	emailChangeTokensRepo,
	emailVerifyTokensRepo,
} from "../repos/email-token-repos";
import { logger } from "../logger";
import { CustomError, handleException, isCustomError } from "$lib/errors";

type EmailTokenServiceDeps = {
	tokenRepo: EmailTokenRepo;
};

type IssueTokenProps = {
	userId: string;
	email: string;
};

type RevokeTokenProps = {
	userId: string;
};

type EmailTokenServiceProps = {
	expiresIn?: TimeSpan;
	tokenLength?: number;
	tokenChars?: string;
};

export class EmailTokenService {
	expiresIn = new TimeSpan(8, "h");
	tokenLength = 6;
	tokenChars = "0-9";

	constructor(
		private deps: EmailTokenServiceDeps,
		props?: EmailTokenServiceProps
	) {
		this.expiresIn = props?.expiresIn ?? this.expiresIn;
		this.tokenLength = props?.tokenLength ?? this.tokenLength;
		this.tokenChars = props?.tokenChars ?? this.tokenChars;
	}

	private generateTokenWithExpiration() {
		const expiresAt = createDate(this.expiresIn).getTime();
		const token = generateRandomString(this.tokenLength, this.tokenChars);
		return { token, expiresAt };
	}

	async issueToken(props: IssueTokenProps) {
		try {
			/* Clear any existing tokens for this user within this repo. */
			await this.deps.tokenRepo.deleteByUserId(props.userId);
			const { expiresAt, token } = this.generateTokenWithExpiration();
			return await this.deps.tokenRepo.create({
				...props,
				expiresAt,
				token,
			});
		} catch (err) {
			logger.error(err);
			if (isCustomError(err)) throw err;
			throw new CustomError("TOKEN_ISSUE_ERROR");
		}
	}

	async revokeTokenByUserId(props: RevokeTokenProps, tx = this.deps.tokenRepo.db) {
		try {
			await this.deps.tokenRepo.deleteByUserId(props.userId, tx);
		} catch (err) {
			throw new CustomError("TOKEN_REVOKE_ERROR");
		}
	}

	async getTokenByUserId(userId: string) {
		try {
			return await this.deps.tokenRepo.getByUserId(userId);
		} catch (err) {
			throw handleException(err);
		}
	}
}

export const emailVerifyTokensService = new EmailTokenService({ tokenRepo: emailVerifyTokensRepo });
export const emailChangeTokensService = new EmailTokenService({ tokenRepo: emailChangeTokensRepo });
