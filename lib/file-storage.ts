import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Base directory for file storage
const STORAGE_BASE_DIR = process.env.FILE_STORAGE_PATH || './uploads'

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
]

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export interface SavedFile {
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

// Validate file before upload
export function validateFile(file: File): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: PDF, Word, Excel, PowerPoint, images, text files.`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    }
  }

  return { valid: true }
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 50)
  return `${baseName}-${uuidv4().substring(0, 8)}${ext}`
}

// Get storage path for entity
function getStoragePath(entityType: 'contract' | 'correspondence', entityId: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return path.join(STORAGE_BASE_DIR, entityType, year.toString(), month, entityId)
}

// Ensure directory exists
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

// Save file to local storage
export async function saveFile(
  file: File,
  entityType: 'contract' | 'correspondence',
  entityId: string
): Promise<SavedFile> {
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const storagePath = getStoragePath(entityType, entityId)
  await ensureDirectory(storagePath)

  const fileName = generateFileName(file.name)
  const filePath = path.join(storagePath, fileName)

  // Convert File to Buffer and save
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fs.writeFile(filePath, buffer)

  return {
    fileName,
    originalName: file.name,
    filePath,
    fileSize: file.size,
    mimeType: file.type,
  }
}

// Delete file from storage
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Error deleting file:', error)
    // Don't throw - file might already be deleted
  }
}

// Read file from storage
export async function readFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath)
}

// Check if file exists
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

// Get file extension from mime type
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'text/plain': '.txt',
    'text/csv': '.csv',
  }
  return mimeToExt[mimeType] || ''
}
