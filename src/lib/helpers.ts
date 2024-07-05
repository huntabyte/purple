import type { ErrorCode } from "./errors";

export type Message = {
	code?: ErrorCode;
	type: "error" | "success";
	text: string;
};

export function createMessage(msg: Message): Message {
	return msg;
}

export function successMessage(text: string): Message {
	return createMessage({ text, type: "success" });
}

export function errorMessage(msg: Omit<Message, "type">): Message {
	return createMessage({ ...msg, type: "error" });
}
