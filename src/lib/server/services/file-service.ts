import type { S3Client } from "@aws-sdk/client-s3";
import { fileClient } from "../file-client";

export class FileService {
	constructor(private client: S3Client) {}
}

export const fileService = new FileService(fileClient);
