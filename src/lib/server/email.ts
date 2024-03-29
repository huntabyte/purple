import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: "localhost",
	port: 2500,
	secure: false, // Use `true` for port 465, `false` for all other ports
});

type SendEmailParams = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

export async function sendEmail(params: SendEmailParams) {
	try {
		const info = await transporter.sendMail({
			from: '"Purple 👻" <purple@example.com>', // sender address
			...params,
		});

		return info.messageId;
	} catch {
		throw new Error("Failed to send email");
	}
}
