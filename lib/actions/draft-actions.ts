"use server"

import { v4 as uuidv4 } from 'uuid'

// Draft storage (in production, this would use the database)
const DRAFTS_STORAGE: Map<string, Draft> = new Map()

export interface Draft {
  draftId: string
  userId: string
  draftType: 'contract' | 'correspondence'
  formData: Record<string, unknown>
  currentStep: number
  totalSteps: number
  progressPercentage: number
  submissionStatusId: number // 1=DRAFT, 2=IN_PROGRESS, 3=VALIDATION_FAILED, 4=SUBMISSION_FAILED
  submissionAttempts: number
  lastSubmissionError: string | null
  lastSubmissionErrorType: string | null
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  title: string // For display in dashboard
}

export interface DraftDocument {
  documentId: string
  draftId: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: Date
}

export interface SaveDraftResult {
  success: boolean
  draftId?: string
  error?: string
}

export interface GetDraftResult {
  success: boolean
  draft?: Draft
  documents?: DraftDocument[]
  error?: string
}

export interface SubmissionAttemptResult {
  success: boolean
  referenceNumber?: string
  error?: string
  errorType?: 'VALIDATION' | 'NETWORK' | 'SERVER' | 'TIMEOUT' | 'UNKNOWN'
  canRetry?: boolean
}

// Calculate progress based on form data
function calculateProgress(formData: Record<string, unknown>, draftType: 'contract' | 'correspondence'): number {
  const requiredFields = draftType === 'contract' 
    ? ['contractNature', 'contractCategory', 'counterpartyName', 'contractValue', 'contractStartDate', 'contractEndDate']
    : ['correspondenceType', 'subject', 'description', 'submitterType']
  
  const filledFields = requiredFields.filter(field => {
    const value = formData[field]
    return value !== undefined && value !== null && value !== ''
  })
  
  return Math.round((filledFields.length / requiredFields.length) * 100)
}

// Generate a title for the draft based on form data
function generateDraftTitle(formData: Record<string, unknown>, draftType: 'contract' | 'correspondence'): string {
  if (draftType === 'contract') {
    const nature = formData.contractNature as string || 'Contract'
    const counterparty = formData.counterpartyName as string || 'Unknown'
    return `${nature.charAt(0).toUpperCase() + nature.slice(1)} - ${counterparty}`
  } else {
    const type = formData.correspondenceType as string || 'Correspondence'
    const subject = formData.subject as string || 'Untitled'
    return `${type} - ${subject.substring(0, 50)}`
  }
}

/**
 * Save or update a draft
 */
export async function saveDraft(
  userId: string,
  draftType: 'contract' | 'correspondence',
  formData: Record<string, unknown>,
  currentStep: number,
  totalSteps: number,
  existingDraftId?: string
): Promise<SaveDraftResult> {
  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    const draftId = existingDraftId || uuidv4()
    const progressPercentage = calculateProgress(formData, draftType)
    const title = generateDraftTitle(formData, draftType)
    
    const draft: Draft = {
      draftId,
      userId,
      draftType,
      formData,
      currentStep,
      totalSteps,
      progressPercentage,
      submissionStatusId: currentStep === totalSteps ? 2 : 1, // IN_PROGRESS or DRAFT
      submissionAttempts: existingDraftId ? (DRAFTS_STORAGE.get(existingDraftId)?.submissionAttempts || 0) : 0,
      lastSubmissionError: null,
      lastSubmissionErrorType: null,
      createdAt: existingDraftId ? (DRAFTS_STORAGE.get(existingDraftId)?.createdAt || now) : now,
      updatedAt: now,
      expiresAt,
      title
    }
    
    DRAFTS_STORAGE.set(draftId, draft)
    
    console.log(`[v0] Draft saved: ${draftId}, type: ${draftType}, progress: ${progressPercentage}%`)
    
    return { success: true, draftId }
  } catch (error) {
    console.error('[v0] Error saving draft:', error)
    return { success: false, error: 'Failed to save draft' }
  }
}

/**
 * Get a draft by ID
 */
export async function getDraft(draftId: string): Promise<GetDraftResult> {
  try {
    const draft = DRAFTS_STORAGE.get(draftId)
    
    if (!draft) {
      return { success: false, error: 'Draft not found' }
    }
    
    // Check if expired
    if (new Date() > draft.expiresAt) {
      DRAFTS_STORAGE.delete(draftId)
      return { success: false, error: 'Draft has expired' }
    }
    
    return { success: true, draft, documents: [] }
  } catch (error) {
    console.error('[v0] Error getting draft:', error)
    return { success: false, error: 'Failed to retrieve draft' }
  }
}

/**
 * Get all drafts for a user
 */
export async function getUserDrafts(userId: string): Promise<{ success: boolean; drafts: Draft[]; error?: string }> {
  try {
    const userDrafts = Array.from(DRAFTS_STORAGE.values())
      .filter(draft => draft.userId === userId && new Date() < draft.expiresAt)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    
    return { success: true, drafts: userDrafts }
  } catch (error) {
    console.error('[v0] Error getting user drafts:', error)
    return { success: false, drafts: [], error: 'Failed to retrieve drafts' }
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(draftId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (DRAFTS_STORAGE.has(draftId)) {
      DRAFTS_STORAGE.delete(draftId)
      return { success: true }
    }
    return { success: false, error: 'Draft not found' }
  } catch (error) {
    console.error('[v0] Error deleting draft:', error)
    return { success: false, error: 'Failed to delete draft' }
  }
}

/**
 * Record a submission attempt
 */
export async function recordSubmissionAttempt(
  draftId: string,
  wasSuccessful: boolean,
  errorType?: string,
  errorMessage?: string,
  referenceNumber?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const draft = DRAFTS_STORAGE.get(draftId)
    
    if (!draft) {
      return { success: false, error: 'Draft not found' }
    }
    
    draft.submissionAttempts += 1
    draft.updatedAt = new Date()
    
    if (wasSuccessful) {
      // Remove draft on successful submission
      DRAFTS_STORAGE.delete(draftId)
    } else {
      draft.submissionStatusId = 4 // SUBMISSION_FAILED
      draft.lastSubmissionError = errorMessage || 'Unknown error'
      draft.lastSubmissionErrorType = errorType || 'UNKNOWN'
      DRAFTS_STORAGE.set(draftId, draft)
    }
    
    console.log(`[v0] Submission attempt recorded for draft ${draftId}: success=${wasSuccessful}`)
    
    return { success: true }
  } catch (error) {
    console.error('[v0] Error recording submission attempt:', error)
    return { success: false, error: 'Failed to record submission attempt' }
  }
}

/**
 * Auto-save draft (called periodically by the form)
 */
export async function autoSaveDraft(
  userId: string,
  draftType: 'contract' | 'correspondence',
  formData: Record<string, unknown>,
  currentStep: number,
  totalSteps: number,
  existingDraftId?: string
): Promise<SaveDraftResult> {
  // Same as saveDraft but with additional logging for auto-save
  console.log(`[v0] Auto-saving draft for user ${userId}, step ${currentStep}/${totalSteps}`)
  return saveDraft(userId, draftType, formData, currentStep, totalSteps, existingDraftId)
}

/**
 * Get failed submissions for user (for dashboard display)
 */
export async function getFailedSubmissions(userId: string): Promise<{ success: boolean; drafts: Draft[]; error?: string }> {
  try {
    const failedDrafts = Array.from(DRAFTS_STORAGE.values())
      .filter(draft => 
        draft.userId === userId && 
        draft.submissionStatusId === 4 && // SUBMISSION_FAILED
        new Date() < draft.expiresAt
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    
    return { success: true, drafts: failedDrafts }
  } catch (error) {
    console.error('[v0] Error getting failed submissions:', error)
    return { success: false, drafts: [], error: 'Failed to retrieve failed submissions' }
  }
}
