import { type EmailClient, emailClient } from "../email-client";
import { handleException } from "$lib/errors";
import { BASE_URL } from "$env/static/private";

type SendEmailVerificationEmailProps = {
	email: string;
	token: string;
};

type SendEmailChangeRequestEmailProps = {
	newEmail: string;
	token: string;
};

type SendEmailChangeNotificationEmailProps = {
	newEmail: string;
	originalEmail: string;
};

/**
 * Handles sending various types of transactional emails to users.
 */
export class EmailService {
	constructor(private readonly client: EmailClient) {}

	/**
	 * Sends an email containing a verification token the user's email address.
	 * This is used to verify the user's email address when they sign up.
	 */
	async sendEmailVerificationEmail({ email, token }: SendEmailVerificationEmailProps) {
		try {
			const messageId = await this.client.sendEmail({
				to: email,
				subject: "Verify your email",
				text: `Your verification token is: ${token}`,
				html: `<p>Your verification token is: <b>${token}</b></p>`,
			});
			return messageId;
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Sends an email containing a verification token to the new email address
	 * when a user requests to change their email address.
	 */
	async sendEmailChangeRequestEmail({ newEmail, token }: SendEmailChangeRequestEmailProps) {
		try {
			const messageId = await this.client.sendEmail({
				to: newEmail,
				subject: "Confirm your email change",
				text: `Your email change verification token is: ${token}. Enter the verification token here: ${BASE_URL}/settings/verify-email-change`,
				html: `<p>Your email change verification token is: <b>${token}</b></p><a href="${BASE_URL}/settings/verify-email-change">Enter the verification token here</a>`,
			});
			return messageId;
		} catch (err) {
			throw handleException(err);
		}
	}

	/**
	 * Sends a courtesy email to the original email address when a user changes
	 * the email address associated with their account.
	 */
	async sendEmailChangeNotificationEmail({
		newEmail,
		originalEmail,
	}: SendEmailChangeNotificationEmailProps) {
		try {
			const messageId = await this.client.sendEmail({
				to: originalEmail,
				subject: "Purple Account Email Change",
				text: `Your email address has been changed to ${newEmail}. If you did not request this change, please contact support.`,
				html: `<p>Your email address has been changed to <b>${newEmail}</b>. If you did not request this change, please contact support.</p>`,
			});
			return messageId;
		} catch (err) {
			throw handleException(err);
		}
	}
}

export const emailService = new EmailService(emailClient);
