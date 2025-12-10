import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

interface KmsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  accountId: string;
  region: string;
  keyId: string;
}

@Injectable()
export class KmsService {
  private readonly kmsClient: KMSClient;
  private readonly keyId: string;

  constructor(private readonly configService: ConfigService) {
    const config = this._getKmsConfig();

    this.keyId = config.keyId;

    this.kmsClient = this._createKmsClient(config);
  }

  public async encryptKey(key: number[]): Promise<string | undefined> {
    const command = new EncryptCommand({
      KeyId: this.keyId,
      Plaintext: Buffer.from(key),
    });

    const response = await this.kmsClient.send(command);

    return response.CiphertextBlob
      ? Buffer.from(response.CiphertextBlob).toString('base64')
      : undefined;
  }

  public async decryptKey(
    encryptedKey: string,
  ): Promise<Uint8Array | undefined> {
    const command = new DecryptCommand({
      KeyId: this.keyId,
      CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
    });

    const response = await this.kmsClient.send(command);

    return response.Plaintext;
  }

  private _getKmsConfig(): KmsConfig {
    return {
      accessKeyId: this.configService.getOrThrow<string>(
        'AWS_KMS_ACCESS_KEY_ID',
      ),
      secretAccessKey: this.configService.getOrThrow<string>(
        'AWS_KMS_SECRET_ACCESS_KEY',
      ),
      accountId: this.configService.getOrThrow<string>('AWS_KMS_ACCOUNT_ID'),
      region: this.configService.getOrThrow<string>('AWS_KMS_REGION'),
      keyId: this.configService.getOrThrow<string>('AWS_KMS_KEY_ID'),
    };
  }

  private _createKmsClient(config: KmsConfig): KMSClient {
    return new KMSClient({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        accountId: config.accountId,
      },
      region: config.region,
    });
  }
}
