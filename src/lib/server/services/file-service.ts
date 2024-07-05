import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileClient } from "../file-client";
import type { User } from "../database/tables";
import { CF_R2_BUCKET_NAME } from "$env/static/private";
import { isAcceptedImageType } from "$lib/constants";
import { CustomError } from "$lib/errors";

type UploadProfilePictureProps = {
	user: User;
	mimeType: string;
	size: number;
	checksum: string;
};

export class FileService {
	#bucketName = CF_R2_BUCKET_NAME;
	constructor(private client: S3Client) {}

	async getUploadProfilePictureUrl({ user, mimeType, size, checksum }: UploadProfilePictureProps) {
		if (!isAcceptedImageType(mimeType)) throw new CustomError("INVALID_IMAGE_TYPE");
		const ext = mimeType.split("/")[1];

		const cmd = new PutObjectCommand({
			Bucket: this.#bucketName,
			Key: `${user.id}/profile/avatar.${ext}`,
			ContentType: mimeType,
			ContentLength: size,
			ChecksumSHA256: checksum,
		});
		return await getSignedUrl(this.client, cmd, { expiresIn: 60 * 60 });
	}
}

export const fileService = new FileService(fileClient);
