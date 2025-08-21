import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get('DO_SPACES_ENDPOINT'),
      region: this.configService.get('DO_SPACES_REGION'),
      credentials: {
        accessKeyId: this.configService.get('DO_SPACES_KEY'),
        secretAccessKey: this.configService.get('DO_SPACES_SECRET'),
      },
    });
    this.bucketName = this.configService.get('DO_SPACES_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<{ fileId: string; url: string }> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit.');
    }

    const fileId = uuidv4();
    const fileExtension = file.originalname.split('.').pop();
    const key = `${folder}/${fileId}.${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = `${this.configService.get('DO_SPACES_ENDPOINT')}/${this.bucketName}/${key}`;

      return { fileId: key, url };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async uploadSurveyPhoto(file: Express.Multer.File, jobId: string): Promise<{ fileId: string; url: string }> {
    return this.uploadFile(file, `surveys/${jobId}`);
  }

  async uploadResistivityGraph(file: Express.Multer.File, jobId: string): Promise<{ fileId: string; url: string }> {
    return this.uploadFile(file, `graphs/${jobId}`);
  }
}