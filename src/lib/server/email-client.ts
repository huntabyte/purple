import nodemailer from "nodemailer";
import { logger } from "./logger";
import { CustomError } from "$lib/errors";

const transporter = nodemailer.createTransport({
	host: "localhost",
	port: 2500,
	secure: false, // Use `true` for port 465, `false` for all other ports
});

type SendEmailProps = {
	from?: string;
	to: string;
	subject: string;
	text: string;
	html: string;
};

/**
 * In the future, we'll likely switch to a more robust email service. Creating
 * this class allows us to easily switch out the underlying email client without
 * having to change the rest of the codebase.
 */
export class EmailClient {
	constructor(private readonly client: typeof transporter) {}

	async sendEmail(props: SendEmailProps) {
		try {
			const info = await this.client.sendMail({
				from: '"Purple 👻" <purple@example.com>',
				...props,
			});
			return info.messageId;
		} catch (err) {
			throw new CustomError("SEND_EMAIL_ERROR");
		}
	}
}

export const emailClient = new EmailClient(transporter);
