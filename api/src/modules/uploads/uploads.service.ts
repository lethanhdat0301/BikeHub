import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

@Injectable()
export class UploadsService implements OnModuleInit {
  private storage!: Storage;
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET || '';

    if (!this.bucketName) {
      throw new Error('GCS_BUCKET environment variable is required');
    }

    this.initStorageClient();
  }

  /**
   * Priority:
   * 1. Workload Identity / ADC
   * 2. service-account.json (fallback)
   */
  private initStorageClient() {
    const jsonKeyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // 1️⃣ Try ADC (Workload Identity / Metadata)
    try {
      this.storage = new Storage();
      console.info(
        'GCS initialized using Application Default Credentials (Workload Identity / Metadata)',
      );
      return;
    } catch (adcError) {
      console.warn('ADC init failed, trying JSON key...', adcError);
    }

    // 2️⃣ Fallback to service-account.json
    if (!jsonKeyFile) {
      throw new Error(
        'ADC failed and GOOGLE_APPLICATION_CREDENTIALS is not set',
      );
    }

    try {
      this.storage = new Storage({
        keyFilename: jsonKeyFile,
      });
      console.info(
        `GCS initialized using service-account.json: ${jsonKeyFile}`,
      );
    } catch (jsonError) {
      console.error('Failed to init GCS with JSON key:', jsonError);
      throw jsonError;
    }
  }

  async onModuleInit() {
    if (process.env.GCS_VERIFY_AT_STARTUP === 'true') {
      await this.verifyStorageAccess();
    }
  }

  private async verifyStorageAccess() {
    const bucket = this.storage.bucket(this.bucketName);
    const [exists] = await bucket.exists();

    if (!exists) {
      throw new Error(
        `Bucket "${this.bucketName}" does not exist or is not accessible`,
      );
    }

    console.info(`GCS bucket "${this.bucketName}" is accessible`);
  }

  // =========================
  // Upload image
  // =========================
  async uploadImage(file: any) {
    if (!file?.buffer) {
      throw new BadRequestException('No file buffer');
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const ext = path.extname(file.originalname || '');
    const filename = `${Date.now()}-${uuidv4()}${ext}`;

    const bucket = this.storage.bucket(this.bucketName);
    const fileRef = bucket.file(filename);

    try {
      await fileRef.save(file.buffer, {
        resumable: false, // tránh lỗi ERR_STREAM_DESTROYED
        metadata: {
          contentType: file.mimetype,
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Chỉ cần nếu bucket không public
      try {
        await fileRef.makePublic();
      } catch {
        // ignore nếu bucket policy không cho
      }

      return {
        name: filename,
        url: `https://storage.googleapis.com/${this.bucketName}/${filename}`,
      };
    } catch (e: any) {
      console.error('GCS upload failed:', {
        message: e?.message,
        code: e?.code,
        stack: e?.stack,
      });
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  // =========================
  // Get public URL
  // =========================
  async getFileUrl(filename: string) {
    if (!filename) {
      throw new NotFoundException('Filename required');
    }

    const file = this.storage
      .bucket(this.bucketName)
      .file(filename);

    const [exists] = await file.exists();
    if (!exists) {
      throw new NotFoundException('File not found');
    }

    return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
  }
}
