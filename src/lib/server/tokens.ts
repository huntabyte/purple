import { TimeSpan, createDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";

export function generateTokenWithExpiration(
	expiresIn: TimeSpan = new TimeSpan(8, "h"),
	tokenLength = 6,
	tokenChars = alphabet("0-9")
) {
	const expiresAt = createDate(expiresIn).getTime();
	const token = generateRandomString(tokenLength, tokenChars);
	return { token, expiresAt };
}
