/**
 * St. Mary's English School - IT Club Platform
 * Storage Security & Path Utilities
 * 
 * PROMPT 4: Comprehensive File Validation, Magic Byte Verification & Path Sanitization
 */

import type {
  StorageBucket,
  StorageCategory,
  BucketConfiguration,
  FileValidationResult,
} from '../types/storage.types';

export const BUCKET_CONFIGS: Record<StorageBucket, BucketConfiguration> = {
  'public-media': {
    id: 'public-media',
    name: 'Public Media CDN',
    isPublic: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    description: 'Fast, public media delivery for school club branding, showcase gallery, project previews, event posters, and member avatars.',
    subdirectories: ['branding', 'gallery', 'projects', 'events', 'avatars'],
  },
  'private-documents': {
    id: 'private-documents',
    name: 'Private Document Vault',
    isPublic: false,
    fileSizeLimit: 25 * 1024 * 1024, // 25 MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
    ],
    allowedExtensions: ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'zip'],
    description: 'Encrypted, access-controlled storage for verifiable student certificates, academic question papers, learning worksheets, task submissions, and official school circulars.',
    subdirectories: ['certificates', 'resources', 'exams', 'submissions', 'notices'],
  },
};

/**
 * Strict allowlist of safe extensions. Executables, scripts, HTML, and arbitrary SVGs are blocked.
 */
export const FORBIDDEN_EXTENSIONS = new Set([
  'exe', 'dll', 'bat', 'cmd', 'sh', 'bash', 'zsh', 'bin', 'msi', 'com', 'scr',
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'vbs', 'ps1', 'py', 'php', 'phtml',
  'html', 'htm', 'xhtml', 'svg', 'xml', 'jsp', 'asp', 'aspx', 'cgi', 'pl',
  'jar', 'apk', 'deb', 'rpm', 'dmg', 'iso',
]);

/**
 * Magic numbers (file signatures) to verify actual file content and prevent MIME spoofing.
 */
export const MAGIC_SIGNATURES: {
  mime: string;
  check: (bytes: Uint8Array) => boolean;
}[] = [
  {
    mime: 'image/jpeg',
    check: (b) => b.length >= 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  },
  {
    mime: 'image/png',
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4E &&
      b[3] === 0x47 &&
      b[4] === 0x0D &&
      b[5] === 0x0A &&
      b[6] === 0x1A &&
      b[7] === 0x0A,
  },
  {
    mime: 'image/gif',
    check: (b) =>
      b.length >= 6 &&
      b[0] === 0x47 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x38 &&
      (b[4] === 0x37 || b[4] === 0x39) &&
      b[5] === 0x61,
  },
  {
    mime: 'image/webp',
    check: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 && // 'RIFF'
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50, // 'WEBP'
  },
  {
    mime: 'application/pdf',
    check: (b) =>
      b.length >= 4 &&
      b[0] === 0x25 &&
      b[1] === 0x50 &&
      b[2] === 0x44 &&
      b[3] === 0x46, // '%PDF'
  },
  {
    // ZIP header (also used by DOCX, XLSX, PPTX)
    mime: 'application/zip',
    check: (b) =>
      b.length >= 4 &&
      b[0] === 0x50 &&
      b[1] === 0x4B &&
      (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07) &&
      (b[3] === 0x04 || b[3] === 0x06 || b[3] === 0x08),
  },
];

/**
 * Strips dangerous path traversal sequences, control characters, and special characters.
 */
export function sanitizeFilename(originalName: string): { base: string; ext: string; sanitized: string } {
  // Strip path traversal attempts and directory separators
  const cleanName = originalName
    .replace(/^.*[\\/]/, '') // remove path
    .replace(/\0/g, '') // remove null bytes
    .trim();

  const lastDotIndex = cleanName.lastIndexOf('.');
  let rawBase = lastDotIndex !== -1 ? cleanName.substring(0, lastDotIndex) : cleanName;
  let rawExt = lastDotIndex !== -1 ? cleanName.substring(lastDotIndex + 1).toLowerCase() : '';

  // Sanitize base: allow only alphanumeric, underscores, hyphens
  const base = rawBase
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/^-+|-+$/g, '') || 'file';

  // Sanitize extension: only alphanumeric
  const ext = rawExt.replace(/[^a-z0-9]/g, '').substring(0, 10);

  return {
    base,
    ext,
    sanitized: ext ? `${base}.${ext}` : base,
  };
}

/**
 * Validates a file before upload against size, MIME, extension, and magic signature.
 */
export async function validateFile(
  file: File | { name: string; size: number; type: string; arrayBuffer?: () => Promise<ArrayBuffer> },
  bucket: StorageBucket,
  headerBuffer?: Uint8Array
): Promise<FileValidationResult> {
  const config = BUCKET_CONFIGS[bucket];
  if (!config) {
    return { valid: false, error: `Unrecognized bucket '${bucket}'`, fileSizeBytes: file.size };
  }

  // 1. File Size Verification
  if (file.size <= 0) {
    return { valid: false, error: 'File is empty (0 bytes).', fileSizeBytes: 0 };
  }

  if (file.size > config.fileSizeLimit) {
    const limitMB = Math.round(config.fileSizeLimit / (1024 * 1024));
    const currentMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${currentMB} MB) exceeds maximum allowed limit for ${config.name} (${limitMB} MB).`,
      fileSizeBytes: file.size,
    };
  }

  // 2. Extension Verification
  const { ext } = sanitizeFilename(file.name);
  if (!ext) {
    return { valid: false, error: 'File has no extension.', fileSizeBytes: file.size };
  }

  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Security violation: Extension .${ext} is strictly prohibited to prevent executable script execution.`,
      fileSizeBytes: file.size,
      detectedExtension: ext,
    };
  }

  if (!config.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Extension .${ext} is not permitted in bucket '${bucket}'. Allowed extensions: ${config.allowedExtensions.join(', ')}`,
      fileSizeBytes: file.size,
      detectedExtension: ext,
    };
  }

  // 3. MIME Type Verification
  const reportedMime = (file.type || '').toLowerCase();
  if (reportedMime && !config.allowedMimeTypes.includes(reportedMime)) {
    // Special case: Office openxml files might have generic application/zip or octet-stream in some browsers
    const isOfficeDoc = ['docx', 'xlsx', 'pptx'].includes(ext) && (reportedMime === 'application/zip' || reportedMime === 'application/x-zip-compressed');
    if (!isOfficeDoc) {
      return {
        valid: false,
        error: `MIME type '${reportedMime}' is not permitted in ${config.name}. Allowed: ${config.allowedMimeTypes.join(', ')}`,
        fileSizeBytes: file.size,
        detectedMime: reportedMime,
      };
    }
  }

  // 4. Content Signature (Magic Bytes) Verification
  let buffer = headerBuffer;
  if (!buffer && typeof (file as any).arrayBuffer === 'function') {
    try {
      const slice = (file as any).slice(0, 32);
      const ab = await slice.arrayBuffer();
      buffer = new Uint8Array(ab);
    } catch {
      // Browser unable to slice buffer; proceed with extension validation
    }
  }

  if (buffer && buffer.length >= 4) {
    // Check if matching signature is present
    const matchedSig = MAGIC_SIGNATURES.find((sig) => sig.check(buffer!));

    // If it is an image bucket, verify it actually matches a recognized image header
    if (bucket === 'public-media') {
      if (!matchedSig || !matchedSig.mime.startsWith('image/')) {
        return {
          valid: false,
          error: 'Content integrity failure: File content signature does not match a valid image format (JPEG, PNG, WebP, GIF).',
          fileSizeBytes: file.size,
          detectedMime: matchedSig?.mime || 'unknown',
        };
      }
    }

    // If it's a PDF in private-documents, verify %PDF signature
    if (ext === 'pdf' && (!matchedSig || matchedSig.mime !== 'application/pdf')) {
      return {
        valid: false,
        error: 'Content integrity failure: File claims to be PDF but lacks standard %PDF header signature.',
        fileSizeBytes: file.size,
        detectedMime: matchedSig?.mime || 'corrupt',
      };
    }
  }

  return {
    valid: true,
    fileSizeBytes: file.size,
    detectedExtension: ext,
    detectedMime: reportedMime || 'application/octet-stream',
  };
}

/**
 * Generates an authoritative, collision-resistant storage path.
 */
export function generateStoragePath(params: {
  bucket: StorageBucket;
  category: StorageCategory;
  originalFilename: string;
  entityId?: string;
  userId?: string;
}): string {
  const { category, originalFilename, entityId, userId } = params;
  const { base, ext } = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const safeFilename = `${base}-${randomSuffix}.${ext}`;
  const currentYear = new Date().getFullYear().toString();

  switch (category) {
    case 'branding':
      return `branding/${safeFilename}`;
    case 'gallery':
      return `gallery/${currentYear}/${safeFilename}`;
    case 'projects':
      return `projects/${entityId || 'general'}/${safeFilename}`;
    case 'events':
      return `events/${entityId || 'general'}/${safeFilename}`;
    case 'avatars':
      return `avatars/${userId || 'guest'}/${safeFilename}`;
    case 'certificates':
      return `certificates/${currentYear}/${entityId || 'cert'}/${safeFilename}`;
    case 'resources':
      return `resources/${entityId || 'general'}/${safeFilename}`;
    case 'exams':
      return `exams/${currentYear}/${entityId || 'paper'}/${safeFilename}`;
    case 'submissions':
      return `submissions/${entityId || 'task'}/${userId || 'anonymous'}/${safeFilename}`;
    case 'notices':
      return `notices/${entityId || 'general'}/${safeFilename}`;
    default:
      return `misc/${safeFilename}`;
  }
}
