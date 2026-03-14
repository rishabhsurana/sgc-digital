import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin, logActivity } from '@/lib/auth'
import { readFile, deleteFile, fileExists } from '@/lib/file-storage'

// GET /api/documents/[id] - Download a document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pool = await getConnection()

    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`
        SELECT file_name, original_name, file_path, file_size, mime_type
        FROM Documents
        WHERE id = @id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const document = result.recordset[0]

    // Check if file exists
    const exists = await fileExists(document.file_path)
    if (!exists) {
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(document.file_path)

    // Return file as response
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mime_type,
        'Content-Disposition': `attachment; filename="${document.original_name}"`,
        'Content-Length': document.file_size.toString(),
      },
    })
  } catch (error) {
    console.error('Download document error:', error)
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 })
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pool = await getConnection()

    // Get document info
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`
        SELECT id, file_path, entity_type, entity_id, uploaded_by, original_name
        FROM Documents
        WHERE id = @id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const document = result.recordset[0]

    // Only allow deletion by uploader or admin
    if (document.uploaded_by !== user.id && !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete file from storage
    await deleteFile(document.file_path)

    // Delete record from database
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`DELETE FROM Documents WHERE id = @id`)

    await logActivity(
      user.id,
      'DELETE_DOCUMENT',
      document.entity_type,
      document.entity_id,
      `Deleted document: ${document.original_name}`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
