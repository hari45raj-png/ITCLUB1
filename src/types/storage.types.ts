/**
 * St. Mary's English School - IT Club Platform
 * Storage & Media Management TypeScript Definitions
 * 
 * PROMPT 4: Complete Supabase Storage & Media Architecture
 */

export type StorageBucket = 'public-media' | 'private-documents';

export type PublicMediaCategory =
  | 'branding'
  | 'gallery'
  | 'projects'
  | 'events'
  | 'avatars';

export type PrivateDocumentCategory =
  | 'certificates'
  | 'resources'
  | 'exams'
  | 'submissions'
  | 'notices';

export type StorageCategory = PublicMediaCategory | PrivateDocumentCategory;

export interface BucketConfiguration {
  id: StorageBucket;
  name: string;
  isPublic: boolean;
  fileSizeLimit: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  description: string;
  subdirectories: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
  detectedExtension?: string;
  fileSizeBytes: number;
}

export interface UploadOptions {
  category: StorageCategory;
  entityType?: string;
  entityId?: string;
  customFilename?: string;
  isPublic?: boolean;
  onProgress?: (progressPercent: number) => void;
}

export interface FileMetadataRecord {
  id: string;
  bucket_name: StorageBucket;
  storage_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  entity_type: string | null;
  entity_id: string | null;
  uploaded_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignedUrlResult {
  signedUrl: string;
  expiresInSeconds: number;
  expiresAt: string;
  storagePath: string;
  bucket: StorageBucket;
}

export interface StorageObjectItem {
  name: string;
  id: string | null;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag?: string;
    size?: number;
    mimetype?: string;
    cacheControl?: string;
    lastModified?: string;
    contentLength?: number;
    httpStatusCode?: number;
  } | null;
}

export interface OrphanDetectionReport {
  bucket: StorageBucket;
  scannedAt: string;
  totalStorageObjects: number;
  totalDatabaseRecords: number;
  matchedRecords: number;
  orphanStorageObjects: string[]; // Objects in Storage with no DB record
  missingStorageObjects: string[]; // Records in DB with missing Storage file
}

export interface StorageSecurityTestItem {
  id: string;
  name: string;
  category: 'Bucket Isolation' | 'Type Spoofing' | 'Path Traversal' | 'Signed URLs' | 'Permissions' | 'Integrity';
  status: 'pending' | 'passed' | 'failed';
  details: string;
  enforcedBy: 'Supabase Storage RLS' | 'Server Validation' | 'PostgreSQL Triggers';
}
