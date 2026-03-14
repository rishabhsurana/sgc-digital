import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, logActivity } from '@/lib/auth'
import { saveFile, validateFile } from '@/lib/file-storage'
import { v4 as uuidv4 } from 'uuid'

// GET /api/documents - List documents for an entity
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entity_type and entity_id are required' },
        { status: 400 }
      )
    }

    const pool = await getConnection()
    const result = await pool.request()
      .input('entity_type', sql.NVarChar, entityType)
      .input('entity_id', sql.NVarChar, entityId)
      .query(`
        SELECT d.*, u.name as uploaded_by_name
        FROM Documents d
        LEFT JOIN Users u ON d.uploaded_by = u.id
        WHERE d.entity_type = @entity_type AND d.entity_id = @entity_id
        ORDER BY d.created_at DESC
      `)

    return NextResponse.json({ data: result.recordset })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST /api/documents - Upload a document
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const entityType = formData.get('entity_type') as string | null
    const entityId = formData.get('entity_id') as string | null
    const documentType = formData.get('document_type') as string | null
    const description = formData.get('description') as string | null

    if (!file || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'file, entity_type, and entity_id are required' },
        { status: 400 }
      )
    }

    // Validate entity type
    if (!['contract', 'correspondence'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity_type. Must be "contract" or "correspondence"' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Verify entity exists
    const pool = await getConnection()
    const tableName = entityType === 'contract' ? 'Contracts' : 'Correspondence'
    const entityCheck = await pool.request()
      .input('id', sql.NVarChar, entityId)
      .query(`SELECT id FROM ${tableName} WHERE id = @id`)

    if (entityCheck.recordset.length === 0) {
      return NextResponse.json(
        { error: `${entityType} not found` },
        { status: 404 }
      )
    }

    // Save file to local storage
    const savedFile = await saveFile(
      file,
      entityType as 'contract' | 'correspondence',
      entityId
    )

    // Save document record to database
    const documentId = uuidv4()
    await pool.request()
      .input('id', sql.NVarChar, documentId)
      .input('entity_type', sql.NVarChar, entityType)
      .input('entity_id', sql.NVarChar, entityId)
      .input('file_name', sql.NVarChar, savedFile.fileName)
      .input('original_name', sql.NVarChar, savedFile.originalName)
      .input('file_path', sql.NVarChar, savedFile.filePath)
      .input('file_size', sql.BigInt, savedFile.fileSize)
      .input('mime_type', sql.NVarChar, savedFile.mimeType)
      .input('document_type', sql.NVarChar, documentType || 'attachment')
      .input('uploaded_by', sql.NVarChar, user.id)
      .input('description', sql.NVarChar, description || null)
      .query(`
        INSERT INTO Documents (
          id, entity_type, entity_id, file_name, original_name, file_path,
          file_size, mime_type, document_type, uploaded_by, description
        )
        VALUES (
          @id, @entity_type, @entity_id, @file_name, @original_name, @file_path,
          @file_size, @mime_type, @document_type, @uploaded_by, @description
        )
      `)

    await logActivity(
      user.id,
      'UPLOAD_DOCUMENT',
      entityType,
      entityId,
      `Uploaded document: ${savedFile.originalName}`
    )

    return NextResponse.json({
      success: true,
      id: documentId,
      fileName: savedFile.fileName,
      originalName: savedFile.originalName,
    }, { status: 201 })
  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
