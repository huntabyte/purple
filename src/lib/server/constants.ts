/**
 * Public-facing error messages. These are meant to be shown to the user and
 * are not meant to contain sensitive server-side information.
 */
export const ERROR_MESSAGES = {
	DEFAULT: (err = "") => `Something went wrong :/\n${err || ""}`,
	CREATE_USER_ERROR:
		"Whoops! Something went wrong while creating your account. Please try again or contact support if the problem persists.",
	DELETE_USER_ERROR:
		"Whoops! Something went wrong while deleting the account. Please try again or contact support if the problem persists.",
	USER_ALREADY_EXISTS:
		"An account with that email already exists. Please log in with your existing account.",
	INVALID_CREDENTIALS:
		"Invalid email or password. Please re-enter your credentials or reset your password if you've forgotten it.",
	TOKEN_INVALID: "The token you provided is invalid.",
	TOKEN_EXPIRED: "The token you provided has expired. Please request a new one.",
	UNAUTHORIZED: "You are not authorized to perform this action.",
	NOT_FOUND: "We couldn't find what you were looking for.",
};
