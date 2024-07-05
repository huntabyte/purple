export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function isAcceptedImageType(mimeType: string) {
	return ACCEPTED_IMAGE_TYPES.includes(mimeType);
}
