import type { ErrorCode } from "./errors";

export type Message = {
	code?: ErrorCode;
	type: "error" | "success";
	text: string;
};

export function createMessage(msg: Message): Message {
	return msg;
}
