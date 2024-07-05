import { LibsqlError } from "@libsql/client";
import { ERROR_MESSAGES } from "./server/constants";
import { logger } from "./server/logger";

type HttpErrorCode =
	| "BAD_REQUEST"
	| "UNAUTHORIZED"
	| "NOT_FOUND"
	| "METHOD_NOT_ALLOWED"
	| "NOT_ACCEPTABLE"
	| "REQUEST_TIMEOUT"
	| "CONFLICT"
	| "GONE"
	| "LENGTH_REQUIRED"
	| "PRECONDITION_FAILED"
	| "PAYLOAD_TOO_LARGE"
	| "URI_TOO_LONG"
	| "UNSUPPORTED_MEDIA_TYPE"
	| "RANGE_NOT_SATISFIABLE"
	| "EXPECTATION_FAILED"
	| "TEAPOT"
	| "FORBIDDEN"
	| "INTERNAL_ERROR";

type CustomErrorCode =
	| "VALIDATION_ERROR"
	| "USER_NOT_FOUND"
	| "INVALID_CREDENTIALS"
	| "USER_ALREADY_EXISTS"
	| "CREATE_USER_ERROR"
	| "TOKEN_EXPIRED"
	| "TOKEN_INVALID"
	| "SEND_EMAIL_ERROR"
	| "TOKEN_ISSUE_ERROR"
	| "TOKEN_REVOKE_ERROR"
	| "INVALID_IMAGE_TYPE";

export type ErrorCode = HttpErrorCode | CustomErrorCode;

// Pulled from sveltekit-superforms to align the type with the error codes it expects
export type NumericRange<
	START extends number,
	END extends number,
	ARR extends unknown[] = [],
	ACC extends number = never,
> = ARR["length"] extends END
	? ACC | START | END
	: NumericRange<START, END, [...ARR, 1], ARR[START] extends undefined ? ACC : ACC | ARR["length"]>;
export type ErrorStatus = NumericRange<400, 599>;

const errorCodeToStatusMap: Record<ErrorCode, ErrorStatus> = {
	BAD_REQUEST: 400,
	VALIDATION_ERROR: 400,
	UNAUTHORIZED: 401,
	INVALID_CREDENTIALS: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	USER_NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	REQUEST_TIMEOUT: 408,
	USER_ALREADY_EXISTS: 409,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	PRECONDITION_FAILED: 412,
	PAYLOAD_TOO_LARGE: 413,
	URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	RANGE_NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	TEAPOT: 418,
	INTERNAL_ERROR: 500,
	CREATE_USER_ERROR: 500,
	TOKEN_EXPIRED: 401,
	TOKEN_INVALID: 401,
	SEND_EMAIL_ERROR: 500,
	TOKEN_ISSUE_ERROR: 500,
	TOKEN_REVOKE_ERROR: 500,
	INVALID_IMAGE_TYPE: 400,
};

export function getStatusFromErrorCode(code: ErrorCode): ErrorStatus {
	if (code in errorCodeToStatusMap) {
		return errorCodeToStatusMap[code];
	}
	return 500;
}

export function getMessageFromErrorCode(code: ErrorCode): string {
	switch (code) {
		case "BAD_REQUEST":
			return "The request is invalid.";
		case "VALIDATION_ERROR":
			return "The request contains invalid or missing fields";
		case "UNAUTHORIZED":
			return "You are not authorized to perform this action.";
		case "NOT_FOUND":
			return "The requested resources was not found";
		case "USER_NOT_FOUND":
			return "The user was not found.";
		case "INTERNAL_ERROR":
			return "An internal error occurred.";
		case "CONFLICT":
			return "The request conflicts with the current state of the server";
		case "INVALID_CREDENTIALS":
			return "The provided credentials are invalid.";
		case "USER_ALREADY_EXISTS":
			return ERROR_MESSAGES.USER_ALREADY_EXISTS;
		case "CREATE_USER_ERROR":
			return ERROR_MESSAGES.CREATE_USER_ERROR;
		case "SEND_EMAIL_ERROR":
			return "An error occurred while sending the email.";
		case "TOKEN_EXPIRED":
			return "Your token has expired. Please request a new one.";
		case "TOKEN_INVALID":
			return "The token you provided is invalid. Please try again or request a new one.";
		case "INVALID_IMAGE_TYPE":
			return "The image you uploaded is not a valid image type.";
		default:
			return "An internal server error occurred.";
	}
}

export class CustomError extends Error {
	code: ErrorCode;
	status: ErrorStatus;
	details?: unknown;
	constructor(
		code: ErrorCode,
		{ message, details, status }: { message?: string; details?: unknown; status?: ErrorStatus } = {}
	) {
		super(message ?? getMessageFromErrorCode(code));
		this.code = code;
		this.status = status ?? getStatusFromErrorCode(code);
		this.details = details;
	}
}

export function isCustomError(error: unknown): error is CustomError {
	return error instanceof CustomError;
}

export function isLibSqlError(error: unknown): error is LibsqlError {
	return error instanceof LibsqlError;
}

/**
 * Normalize any error into a CustomError.
 */
export function handleException(error: unknown): CustomError {
	logger.error(error);
	if (isCustomError(error)) {
		return error;
	}

	if (isLibSqlError(error)) {
		return new CustomError("INTERNAL_ERROR");
	}
	return new CustomError("INTERNAL_ERROR");
}
