import { S3Client } from '@aws-sdk/client-s3'

export function getR2Client() {

	const isDevelopment = process.env.NODE_ENV === 'development'

	if (isDevelopment) {
		return new S3Client({
			region: 'us-east-1',
			endpoint: 'http://localhost:9000',
			credentials: {
				accessKeyId: 'minioadmin',
				secretAccessKey: 'minioadmin',
			},
			forcePathStyle: true,
		})
	}
	return new S3Client({
		region: 'auto',
		endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY_ID!,
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
		},
	})
}
