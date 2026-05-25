export type CloudinaryUploadResponse ={
  secure_url: string;
  public_id: string;
  asset_id?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
}