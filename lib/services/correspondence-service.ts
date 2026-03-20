import { CorrespondenceRepository } from '@/lib/db/repositories/correspondence-repository'
import { BPMCaseRepository } from '@/lib/db/repositories/bpm-case-repository'
import { WorkflowEngine } from '@/lib/services/workflow-engine'
import { Correspondence, BPMCase, CorrespondenceStatus } from '@/lib/types/database'

export interface CreateCorrespondenceInput {
  typeId: string
  subject: string
  description: string
  urgencyLevel: 'normal' | 'urgent' | 'critical'
  confidentialFlag: boolean
  submitterId: string
  organizationId?: string
  parties?: Array<{
    partyType: string
    name: string
    organization?: string
    email?: string
    phone?: string
  }>
}

export interface AssignCorrespondenceInput {
  correspondenceId: string
  assignedOfficerId: string
  assignedById: string
  directiveSummary?: string
  bringUpDate?: Date
  notes?: string
}

export interface UpdateCorrespondenceStatusInput {
  correspondenceId: string
  newStatus: CorrespondenceStatus
  changedById: string
  reason?: string
  notes?: string
}

export class CorrespondenceService {
  private correspondenceRepo: CorrespondenceRepository
  private bpmCaseRepo: BPMCaseRepository
  private workflowEngine: WorkflowEngine

  constructor() {
    this.correspondenceRepo = new CorrespondenceRepository()
    this.bpmCaseRepo = new BPMCaseRepository()
    this.workflowEngine = new WorkflowEngine()
  }

  /**
   * Submit new correspondence from public portal
   */
  async submitCorrespondence(input: CreateCorrespondenceInput): Promise<{ correspondence: Correspondence; bpmCase: BPMCase }> {
    // Generate reference number
    const referenceNumber = await this.generateReferenceNumber()

    // Create correspondence record
    const correspondence = await this.correspondenceRepo.create({
      reference_number: referenceNumber,
      type_id: input.typeId,
      subject: input.subject,
      description: input.description,
      urgency_level: input.urgencyLevel,
      confidential_flag: input.confidentialFlag,
      submitter_id: input.submitterId,
      organization_id: input.organizationId || null,
      status: 'new',
      submitted_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    })

    // Create BPM case for workflow tracking
    const bpmCase = await this.bpmCaseRepo.createCase({
      caseType: 'correspondence',
      entityId: correspondence.id,
      referenceNumber: referenceNumber,
      currentStage: 'INTAKE',
      currentStatus: 'new',
      priority: input.urgencyLevel === 'critical' ? 'critical' : input.urgencyLevel === 'urgent' ? 'high' : 'normal',
      submitterId: input.submitterId,
      organizationId: input.organizationId
    })

    // Initialize workflow
    await this.workflowEngine.initializeWorkflow(bpmCase.id, 'correspondence')

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'submission',
      description: 'Correspondence submitted via portal',
      performedById: input.submitterId,
      performedByType: 'public_user'
    })

    // Add parties if provided
    if (input.parties && input.parties.length > 0) {
      for (const party of input.parties) {
        await this.correspondenceRepo.addParty({
          correspondence_id: correspondence.id,
          party_type: party.partyType,
          name: party.name,
          organization: party.organization,
          email: party.email,
          phone: party.phone
        })
      }
    }

    // Handle urgent submissions - bypass batching
    if (input.urgencyLevel === 'urgent' || input.urgencyLevel === 'critical') {
      await this.handleUrgentSubmission(correspondence, bpmCase)
    }

    return { correspondence, bpmCase }
  }

  /**
   * Handle urgent submissions - route immediately to SG/DSG
   */
  private async handleUrgentSubmission(correspondence: Correspondence, bpmCase: BPMCase): Promise<void> {
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'system_action',
      description: `Urgent submission flagged - bypassing batch processing`,
      performedById: null,
      performedByType: 'system'
    })

    // Create task for SG/DSG immediate review
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'urgent_review',
      title: `URGENT: Review ${correspondence.reference_number}`,
      description: `Urgent correspondence requires immediate SG/DSG attention`,
      assignedToRole: 'dsg',
      priority: 'critical',
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    })
  }

  /**
   * Registry intake - validate and process received correspondence
   */
  async processIntake(correspondenceId: string, intakeOfficerId: string, intakeData: {
    validated: boolean
    intakeNotes?: string
    securityProfile?: string
  }): Promise<Correspondence> {
    const correspondence = await this.correspondenceRepo.findById(correspondenceId)
    if (!correspondence) {
      throw new Error('Correspondence not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('correspondence', correspondenceId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    if (!intakeData.validated) {
      // Return to submitter for corrections
      await this.updateStatus({
        correspondenceId,
        newStatus: 'returned',
        changedById: intakeOfficerId,
        reason: intakeData.intakeNotes || 'Submission requires corrections'
      })
      return correspondence
    }

    // Update correspondence with intake data
    await this.correspondenceRepo.update(correspondenceId, {
      intake_clerk_id: intakeOfficerId,
      received_at: new Date(),
      security_profile: intakeData.securityProfile || 'standard',
      updated_at: new Date()
    })

    // Advance workflow to REVIEW stage
    await this.workflowEngine.advanceStage(bpmCase.id, 'REVIEW', intakeOfficerId, 'staff')

    // Update status
    await this.updateStatus({
      correspondenceId,
      newStatus: 'pending_review',
      changedById: intakeOfficerId,
      reason: 'Intake validation completed'
    })

    // Create task for SG/DSG daily mail review
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'daily_mail_review',
      title: `Review: ${correspondence.subject}`,
      description: 'New correspondence awaiting SG/DSG review and assignment',
      assignedToRole: 'dsg',
      priority: correspondence.urgency_level === 'urgent' ? 'high' : 'normal',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })

    return await this.correspondenceRepo.findById(correspondenceId) as Correspondence
  }

  /**
   * SG/DSG assigns correspondence to Legal Officer
   */
  async assignToOfficer(input: AssignCorrespondenceInput): Promise<Correspondence> {
    const correspondence = await this.correspondenceRepo.findById(input.correspondenceId)
    if (!correspondence) {
      throw new Error('Correspondence not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('correspondence', input.correspondenceId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Update correspondence with assignment
    await this.correspondenceRepo.update(input.correspondenceId, {
      assigned_officer_id: input.assignedOfficerId,
      directive_summary: input.directiveSummary,
      bring_up_date: input.bringUpDate,
      updated_at: new Date()
    })

    // Update BPM case
    await this.bpmCaseRepo.update(bpmCase.id, {
      assigned_to_id: input.assignedOfficerId,
      assigned_at: new Date()
    })

    // Advance workflow to PROCESS stage
    await this.workflowEngine.advanceStage(bpmCase.id, 'PROCESS', input.assignedById, 'staff')

    // Update status
    await this.updateStatus({
      correspondenceId: input.correspondenceId,
      newStatus: 'assigned',
      changedById: input.assignedById,
      reason: 'Assigned to Legal Officer',
      notes: input.notes
    })

    // Complete the daily mail review task
    const reviewTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'daily_mail_review')
    if (reviewTask) {
      await this.bpmCaseRepo.completeTask(reviewTask.id, input.assignedById)
    }

    // Create task for assigned officer
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'process_correspondence',
      title: `Process: ${correspondence.subject}`,
      description: input.directiveSummary || 'Process correspondence and prepare response',
      assignedToId: input.assignedOfficerId,
      priority: correspondence.urgency_level === 'urgent' ? 'high' : 'normal',
      dueDate: input.bringUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
    })

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'assignment',
      description: `Assigned to Legal Officer`,
      performedById: input.assignedById,
      performedByType: 'staff',
      metadata: { assignedOfficerId: input.assignedOfficerId, directive: input.directiveSummary }
    })

    return await this.correspondenceRepo.findById(input.correspondenceId) as Correspondence
  }

  /**
   * Legal Officer submits response for approval (if required)
   */
  async submitForApproval(correspondenceId: string, officerId: string, responseData: {
    responseText: string
    requiresApproval: boolean
    attachmentIds?: string[]
  }): Promise<Correspondence> {
    const correspondence = await this.correspondenceRepo.findById(correspondenceId)
    if (!correspondence) {
      throw new Error('Correspondence not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('correspondence', correspondenceId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Store draft response
    await this.correspondenceRepo.update(correspondenceId, {
      draft_response: responseData.responseText,
      updated_at: new Date()
    })

    if (responseData.requiresApproval) {
      // Advance to APPROVAL stage
      await this.workflowEngine.advanceStage(bpmCase.id, 'APPROVAL', officerId, 'staff')

      await this.updateStatus({
        correspondenceId,
        newStatus: 'pending_approval',
        changedById: officerId,
        reason: 'Response submitted for SG/DSG approval'
      })

      // Create approval task
      await this.bpmCaseRepo.createTask({
        caseId: bpmCase.id,
        taskType: 'approve_response',
        title: `Approve Response: ${correspondence.reference_number}`,
        description: 'Review and approve outgoing correspondence',
        assignedToRole: 'dsg',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      })
    } else {
      // Skip to DISPATCH stage
      await this.workflowEngine.advanceStage(bpmCase.id, 'DISPATCH', officerId, 'staff')

      await this.updateStatus({
        correspondenceId,
        newStatus: 'ready_dispatch',
        changedById: officerId,
        reason: 'Response ready for dispatch'
      })
    }

    return await this.correspondenceRepo.findById(correspondenceId) as Correspondence
  }

  /**
   * SG/DSG approves outgoing response
   */
  async approveResponse(correspondenceId: string, approverId: string, approved: boolean, comments?: string): Promise<Correspondence> {
    const correspondence = await this.correspondenceRepo.findById(correspondenceId)
    if (!correspondence) {
      throw new Error('Correspondence not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('correspondence', correspondenceId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    if (approved) {
      await this.correspondenceRepo.update(correspondenceId, {
        approved_by_id: approverId,
        approved_at: new Date(),
        final_response: correspondence.draft_response,
        updated_at: new Date()
      })

      // Advance to DISPATCH stage
      await this.workflowEngine.advanceStage(bpmCase.id, 'DISPATCH', approverId, 'staff')

      await this.updateStatus({
        correspondenceId,
        newStatus: 'ready_dispatch',
        changedById: approverId,
        reason: 'Response approved'
      })

      // Create dispatch task
      await this.bpmCaseRepo.createTask({
        caseId: bpmCase.id,
        taskType: 'dispatch',
        title: `Dispatch: ${correspondence.reference_number}`,
        description: 'Dispatch approved correspondence',
        assignedToRole: 'registry_clerk',
        priority: 'normal',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      })
    } else {
      // Return to officer for revision
      await this.workflowEngine.advanceStage(bpmCase.id, 'PROCESS', approverId, 'staff')

      await this.updateStatus({
        correspondenceId,
        newStatus: 'assigned',
        changedById: approverId,
        reason: comments || 'Response requires revision'
      })

      // Create revision task
      await this.bpmCaseRepo.createTask({
        caseId: bpmCase.id,
        taskType: 'revise_response',
        title: `Revise: ${correspondence.reference_number}`,
        description: comments || 'Response requires revision per SG/DSG feedback',
        assignedToId: correspondence.assigned_officer_id!,
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      })
    }

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: approved ? 'approval' : 'rejection',
      description: approved ? 'Response approved by SG/DSG' : 'Response returned for revision',
      performedById: approverId,
      performedByType: 'staff',
      metadata: { approved, comments }
    })

    return await this.correspondenceRepo.findById(correspondenceId) as Correspondence
  }

  /**
   * Dispatch correspondence and close case
   */
  async dispatch(correspondenceId: string, dispatcherId: string, dispatchData: {
    dispatchMethod: 'email' | 'post' | 'courier' | 'hand_delivery'
    trackingNumber?: string
    dispatchNotes?: string
  }): Promise<Correspondence> {
    const correspondence = await this.correspondenceRepo.findById(correspondenceId)
    if (!correspondence) {
      throw new Error('Correspondence not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('correspondence', correspondenceId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    await this.correspondenceRepo.update(correspondenceId, {
      dispatch_date: new Date(),
      dispatch_method: dispatchData.dispatchMethod,
      dispatch_tracking: dispatchData.trackingNumber,
      updated_at: new Date()
    })

    // Advance to CLOSE stage
    await this.workflowEngine.advanceStage(bpmCase.id, 'CLOSE', dispatcherId, 'staff')

    await this.updateStatus({
      correspondenceId,
      newStatus: 'closed',
      changedById: dispatcherId,
      reason: 'Correspondence dispatched and case closed'
    })

    // Close the BPM case
    await this.bpmCaseRepo.update(bpmCase.id, {
      current_status: 'completed',
      closed_at: new Date(),
      closed_by_id: dispatcherId
    })

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'dispatch',
      description: `Dispatched via ${dispatchData.dispatchMethod}`,
      performedById: dispatcherId,
      performedByType: 'staff',
      metadata: dispatchData
    })

    return await this.correspondenceRepo.findById(correspondenceId) as Correspondence
  }

  /**
   * Update correspondence status with history tracking
   */
  async updateStatus(input: UpdateCorrespondenceStatusInput): Promise<void> {
    const correspondence = await this.correspondenceRepo.findById(input.correspondenceId)
    if (!correspondence) {
      throw new Error('Correspondence not found')
    }

    const previousStatus = correspondence.status

    // Update correspondence
    await this.correspondenceRepo.update(input.correspondenceId, {
      status: input.newStatus,
      updated_at: new Date()
    })

    // Record status history
    await this.correspondenceRepo.addStatusHistory({
      correspondence_id: input.correspondenceId,
      from_status: previousStatus,
      to_status: input.newStatus,
      changed_by_id: input.changedById,
      reason: input.reason,
      notes: input.notes
    })

    // Update BPM case status
    const bpmCase = await this.bpmCaseRepo.findByEntityId('correspondence', input.correspondenceId)
    if (bpmCase) {
      await this.bpmCaseRepo.update(bpmCase.id, {
        current_status: input.newStatus
      })
    }
  }

  /**
   * Get correspondence with full details for case view
   */
  async getCorrespondenceWithDetails(correspondenceId: string): Promise<any> {
    const correspondence = await this.correspondenceRepo.findById(correspondenceId)
    if (!correspondence) {
      throw new Error('Correspondence not found')
    }

    const [parties, statusHistory, documents, bpmCase] = await Promise.all([
      this.correspondenceRepo.getParties(correspondenceId),
      this.correspondenceRepo.getStatusHistory(correspondenceId),
      this.correspondenceRepo.getDocuments(correspondenceId),
      this.bpmCaseRepo.findByEntityId('correspondence', correspondenceId)
    ])

    let activities: any[] = []
    let tasks: any[] = []
    let workflowHistory: any[] = []

    if (bpmCase) {
      [activities, tasks, workflowHistory] = await Promise.all([
        this.bpmCaseRepo.getActivities(bpmCase.id),
        this.bpmCaseRepo.getTasks(bpmCase.id),
        this.bpmCaseRepo.getWorkflowHistory(bpmCase.id)
      ])
    }

    return {
      correspondence,
      parties,
      statusHistory,
      documents,
      bpmCase,
      activities,
      tasks,
      workflowHistory
    }
  }

  /**
   * Get work queue for staff user
   */
  async getWorkQueue(staffUserId: string, filters?: {
    stage?: string
    status?: string
    urgency?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<any[]> {
    return this.correspondenceRepo.findByFilters({
      assignedOfficerId: staffUserId,
      ...filters
    })
  }

  /**
   * Get daily mail dashboard items for SG/DSG
   */
  async getDailyMailDashboard(filters?: {
    status?: string
    urgency?: string
    typeId?: string
  }): Promise<any[]> {
    return this.correspondenceRepo.findByFilters({
      status: 'pending_review',
      ...filters
    })
  }

  /**
   * Generate unique reference number
   */
  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.correspondenceRepo.countByYear(year)
    const sequence = (count + 1).toString().padStart(5, '0')
    return `COR-${year}-${sequence}`
  }
}

export const correspondenceService = new CorrespondenceService()
