import { BadRequestException, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_KMS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>(
          'AWS_KMS_ACCESS_KEY_ID',
        ),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_KMS_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.bucketName =
      this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadBlob(data: Buffer, filename?: string): Promise<string> {
    const maxFileSizeBytes = 10 * 1024 * 1024;

    if (data.length > maxFileSizeBytes) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxFileSizeBytes / 1024 / 1024}MB`,
      );
    }

    const key = filename || `${randomUUID()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: data,
    });

    try {
      await this.s3.send(command);
    } catch (error) {
      throw new BadRequestException(
        'Failed to upload blob to S3',
        (error as Error).message,
      );
    }

    return `https://${this.bucketName}.s3.${this.configService.getOrThrow('AWS_KMS_REGION')}.amazonaws.com/${key}`;
  }
}
