import { v2 as cloudinary } from 'cloudinary';
import {
  CommunicationMediaAdapter,
  SignUploadParams,
  SignUploadResult
} from '../../ports/media';

export interface CloudinaryMediaAdapterOptions {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
}

export function createCloudinaryMediaAdapter(
  options: CloudinaryMediaAdapterOptions
): CommunicationMediaAdapter {
  cloudinary.config({
    cloud_name: options.cloudName,
    api_key: options.apiKey,
    api_secret: options.apiSecret
  });

  return {
    async signUpload(params: SignUploadParams): Promise<SignUploadResult> {
      const timestamp = Math.floor(Date.now() / 1000);

      const folder = options.folder ?? `communication/${params.roomId}`;

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder
        },
        options.apiSecret
      );

      return {
        uploadUrl: `https://api.cloudinary.com/v1_1/${options.cloudName}/auto/upload`,
        assetId: `${folder}/${timestamp}`,
        // Client must POST:
        // - file
        // - api_key
        // - timestamp
        // - signature
        // - folder
      };
    }
  };
}
