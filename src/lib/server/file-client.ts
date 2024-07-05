import { S3Client } from "@aws-sdk/client-s3";
import { CF_R2_ACCESS_KEY_ID, CF_R2_ENDPOINT, CF_R2_SECRET_ACCESS_KEY } from "$env/static/private";

export const fileClient = new S3Client({
	endpoint: CF_R2_ENDPOINT,
	credentials: {
		accessKeyId: CF_R2_ACCESS_KEY_ID,
		secretAccessKey: CF_R2_SECRET_ACCESS_KEY,
	},
});
