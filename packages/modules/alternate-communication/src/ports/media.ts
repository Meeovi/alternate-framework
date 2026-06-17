export interface SignUploadParams {
  userId: string;
  roomId: string;
  mimeType: string;
}

export interface SignUploadResult {
  uploadUrl: string;
  assetId: string;
}

export interface CommunicationMediaAdapter {
  signUpload(params: SignUploadParams): Promise<SignUploadResult>;
}
