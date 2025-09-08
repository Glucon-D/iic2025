import { ID } from 'appwrite';
import { storage, BUCKET_ID } from './config';

export interface UploadedFile {
  fileId: string;
  fileUrl: string;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

class StorageService {
  // File validation constants
  static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > StorageService.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!StorageService.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Only images (JPEG, PNG, GIF, WebP) are allowed',
      };
    }

    return { valid: true };
  }

  /**
   * Upload image file to Appwrite bucket
   */
  async uploadImage(file: File): Promise<UploadedFile> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate unique file ID
      const fileId = ID.unique();

      // Upload file to Appwrite storage
      const response = await storage.createFile(
        BUCKET_ID,
        fileId,
        file
      );

      // Generate public URL for the file
      const fileUrl = storage.getFileView(BUCKET_ID, response.$id);
      const urlString = fileUrl.toString();

      return {
        fileId: response.$id,
        fileUrl: urlString,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload image with result wrapper
   */
  async uploadImageSafe(file: File): Promise<UploadResult> {
    try {
      const uploadedFile = await this.uploadImage(file);
      return { success: true, file: uploadedFile };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  getFileUrl(fileId: string): string {
    return storage.getFileView(BUCKET_ID, fileId);
  }

  getFilePreview(fileId: string, width?: number, height?: number): string {
    return storage.getFilePreview(
      BUCKET_ID, 
      fileId, 
      width, 
      height
    );
  }
}

export const storageService = new StorageService();