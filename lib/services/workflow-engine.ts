import { bpmCaseRepository, bpmTaskRepository, bpmActivityRepository } from '@/lib/db/repositories/bpm-case-repository'
import { correspondenceRepository } from '@/lib/db/repositories/correspondence-repository'
import { contractsRepository } from '@/lib/db/repositories/contracts-repository'
import { query, withTransaction } from '@/lib/db/connection'
import type { 
  BPMCase, 
  BPMTask, 
  CaseStatus, 
  Priority,
  CorrespondenceStatus,
  CorrespondenceWorkflowStage,
  ContractStatus,
  ContractWorkflowStage
} from '@/lib/types/database'

// =============================================
// Workflow Definitions
// =============================================

export interface WorkflowStage {
  code: string
  name: string
  sequence: number
  isParallel?: boolean
  allowedRoles: string[]
  slaHours?: number
  inBasket?: string
  actions: WorkflowAction[]
}

export interface WorkflowAction {
  code: string
  name: string
  nextStage?: string
  nextStatus?: string
  requiresNote?: boolean
  requiresAssignment?: boolean
  allowedRoles: string[]
}

export interface WorkflowTransition {
  from: string
  to: string
  action: string
  conditions?: Record<string, unknown>
}

// =============================================
// Contracts Workflow Definition
// =============================================

export const CONTRACTS_WORKFLOW: WorkflowStage[] = [
  {
    code: 'INTAKE',
    name: 'Intake',
    sequence: 1,
    allowedRoles: ['contracts_intake', 'registry_clerk'],
    slaHours: 8,
    inBasket: 'contracts_intake',
    actions: [
      { code: 'validate', name: 'Validate & Accept', nextStage: 'ASSIGN', nextStatus: 'ASSIGNED', requiresNote: false, allowedRoles: ['contracts_intake'] },
      { code: 'return', name: 'Return to MDA', nextStatus: 'RETURNED_CORR', requiresNote: true, allowedRoles: ['contracts_intake'] },
      { code: 'reject', name: 'Reject', nextStatus: 'REJECTED', requiresNote: true, allowedRoles: ['contracts_intake', 'dsg'] },
    ]
  },
  {
    code: 'ASSIGN',
    name: 'Assignment',
    sequence: 2,
    allowedRoles: ['dsg', 'senior_legal_officer'],
    slaHours: 4,
    inBasket: 'contracts_awaiting_approval',
    actions: [
      { code: 'assign', name: 'Assign to Legal Officer', nextStage: 'DRAFT', nextStatus: 'DRAFTING', requiresAssignment: true, allowedRoles: ['dsg', 'senior_legal_officer'] },
    ]
  },
  {
    code: 'FILE_ASSOC',
    name: 'File Association',
    sequence: 2,
    isParallel: true,
    allowedRoles: ['registry_clerk', 'registry_senior_clerk'],
    actions: [
      { code: 'associate', name: 'Associate Files', requiresNote: false, allowedRoles: ['registry_clerk'] },
      { code: 'create_new', name: 'Create New File', requiresNote: false, allowedRoles: ['registry_clerk'] },
      { code: 'not_required', name: 'Not Required', requiresNote: true, allowedRoles: ['registry_clerk'] },
    ]
  },
  {
    code: 'DRAFT',
    name: 'Drafting',
    sequence: 3,
    allowedRoles: ['legal_officer'],
    slaHours: 120, // 5 days
    inBasket: 'contracts_drafting',
    actions: [
      { code: 'submit_review', name: 'Submit for Review', nextStage: 'SUP_REVIEW', nextStatus: 'SUP_REVIEW', allowedRoles: ['legal_officer'] },
      { code: 'request_clarification', name: 'Request Clarification from MDA', nextStatus: 'SENT_MDA', allowedRoles: ['legal_officer'] },
    ]
  },
  {
    code: 'SUP_REVIEW',
    name: 'Supervisor Review',
    sequence: 3,
    allowedRoles: ['dsg', 'senior_legal_officer'],
    slaHours: 24,
    inBasket: 'contracts_awaiting_approval',
    actions: [
      { code: 'approve', name: 'Approve', nextStage: 'MIN_REVIEW', nextStatus: 'SENT_MDA', allowedRoles: ['dsg', 'senior_legal_officer'] },
      { code: 'return', name: 'Return for Revision', nextStage: 'DRAFT', nextStatus: 'DRAFTING', requiresNote: true, allowedRoles: ['dsg', 'senior_legal_officer'] },
    ]
  },
  {
    code: 'MIN_REVIEW',
    name: 'Ministry Review',
    sequence: 4,
    allowedRoles: ['legal_officer'],
    inBasket: 'contracts_with_ministry',
    actions: [
      { code: 'mda_approved', name: 'MDA Approved', nextStage: 'SIGN', nextStatus: 'RETURNED_MDA', allowedRoles: ['legal_officer'] },
      { code: 'mda_comments', name: 'MDA Comments Received', nextStage: 'DRAFT', nextStatus: 'DRAFTING', allowedRoles: ['legal_officer'] },
    ]
  },
  {
    code: 'SIGN',
    name: 'Signature',
    sequence: 5,
    allowedRoles: ['sg', 'dsg', 'legal_officer'],
    slaHours: 48,
    actions: [
      { code: 'sg_signed', name: 'SG Signed', nextStatus: 'FINAL_SIG', allowedRoles: ['sg', 'sg_secretary'] },
      { code: 'mda_signed', name: 'Ministry Signed', nextStage: 'ADJUDICATION', nextStatus: 'EXEC_ADJ', allowedRoles: ['legal_officer'] },
    ]
  },
  {
    code: 'ADJUDICATION',
    name: 'Adjudication',
    sequence: 6,
    allowedRoles: ['legal_officer', 'legal_assistant'],
    inBasket: 'contracts_adjudication',
    actions: [
      { code: 'adjudicated', name: 'Adjudication Complete', nextStage: 'DISPATCH', nextStatus: 'ADJ_COMP', allowedRoles: ['legal_officer', 'legal_assistant'] },
    ]
  },
  {
    code: 'DISPATCH',
    name: 'Dispatch',
    sequence: 7,
    allowedRoles: ['registry_clerk', 'legal_assistant'],
    inBasket: 'contracts_ready_close',
    actions: [
      { code: 'dispatch', name: 'Dispatch to MDA', nextStage: 'CLOSEOUT', nextStatus: 'CLOSED', allowedRoles: ['registry_clerk', 'legal_assistant'] },
    ]
  },
  {
    code: 'CLOSEOUT',
    name: 'Closeout',
    sequence: 8,
    allowedRoles: ['registry_clerk'],
    actions: [
      { code: 'close', name: 'Close Case', nextStatus: 'CLOSED', allowedRoles: ['registry_clerk'] },
    ]
  },
]

// =============================================
// Correspondence Workflow Definition
// =============================================

export const CORRESPONDENCE_WORKFLOW: WorkflowStage[] = [
  {
    code: 'INTAKE',
    name: 'Intake',
    sequence: 1,
    allowedRoles: ['registry_clerk', 'registry_senior_clerk'],
    slaHours: 4,
    inBasket: 'corr_intake',
    actions: [
      { code: 'validate', name: 'Validate & Accept', nextStage: 'SG_DSG_REVIEW', nextStatus: 'PENDING_REVIEW', allowedRoles: ['registry_clerk'] },
      { code: 'return', name: 'Return to Sender', nextStatus: 'CANCELLED', requiresNote: true, allowedRoles: ['registry_clerk'] },
    ]
  },
  {
    code: 'SG_DSG_REVIEW',
    name: 'SG/DSG Review',
    sequence: 2,
    allowedRoles: ['sg', 'dsg', 'sg_secretary'],
    slaHours: 24,
    inBasket: 'corr_daily_mail',
    actions: [
      { code: 'assign', name: 'Assign to Officer', nextStage: 'PROCESSING', nextStatus: 'ASSIGNED', requiresAssignment: true, allowedRoles: ['sg', 'dsg', 'sg_secretary'] },
      { code: 'urgent_route', name: 'Urgent - Route Directly', nextStage: 'PROCESSING', nextStatus: 'ASSIGNED', requiresAssignment: true, allowedRoles: ['sg', 'dsg'] },
    ]
  },
  {
    code: 'FILE_ASSOC',
    name: 'File Association',
    sequence: 2,
    isParallel: true,
    allowedRoles: ['registry_clerk', 'registry_senior_clerk'],
    actions: [
      { code: 'associate', name: 'Associate Files', allowedRoles: ['registry_clerk'] },
      { code: 'create_new', name: 'Create New File', allowedRoles: ['registry_clerk'] },
    ]
  },
  {
    code: 'PROCESSING',
    name: 'Processing',
    sequence: 3,
    allowedRoles: ['legal_officer', 'senior_legal_officer'],
    slaHours: 240, // 10 days default
    inBasket: 'corr_in_progress',
    actions: [
      { code: 'complete', name: 'Mark Complete', nextStage: 'DISPATCH', nextStatus: 'CLOSED', allowedRoles: ['legal_officer'] },
      { code: 'request_approval', name: 'Request Approval', nextStage: 'APPROVAL', allowedRoles: ['legal_officer'] },
      { code: 'pending_external', name: 'Awaiting External Input', nextStatus: 'PENDING_EXTERNAL', allowedRoles: ['legal_officer'] },
      { code: 'hold', name: 'Place on Hold', nextStatus: 'ON_HOLD', requiresNote: true, allowedRoles: ['legal_officer', 'senior_legal_officer'] },
    ]
  },
  {
    code: 'APPROVAL',
    name: 'Approval',
    sequence: 4,
    allowedRoles: ['dsg', 'sg'],
    slaHours: 24,
    actions: [
      { code: 'approve', name: 'Approve', nextStage: 'DISPATCH', allowedRoles: ['dsg', 'sg'] },
      { code: 'return', name: 'Return for Revision', nextStage: 'PROCESSING', requiresNote: true, allowedRoles: ['dsg', 'sg'] },
    ]
  },
  {
    code: 'DISPATCH',
    name: 'Dispatch',
    sequence: 5,
    allowedRoles: ['registry_clerk'],
    inBasket: 'corr_ready_dispatch',
    actions: [
      { code: 'dispatch', name: 'Dispatch', nextStage: 'CLOSED', nextStatus: 'CLOSED', allowedRoles: ['registry_clerk'] },
    ]
  },
  {
    code: 'CLOSED',
    name: 'Closed',
    sequence: 6,
    allowedRoles: ['registry_clerk', 'admin'],
    actions: [
      { code: 'reopen', name: 'Reopen', nextStage: 'PROCESSING', nextStatus: 'IN_PROGRESS', requiresNote: true, allowedRoles: ['dsg', 'admin'] },
    ]
  },
]

// =============================================
// Workflow Engine Service
// =============================================

export class WorkflowEngine {
  /**
   * Create a new BPM case for an entity
   */
  async createCase(
    entityType: 'correspondence' | 'contract',
    entityId: string,
    options?: {
      priority?: Priority
      ownerId?: string
    }
  ): Promise<BPMCase> {
    const workflow = entityType === 'contract' ? CONTRACTS_WORKFLOW : CORRESPONDENCE_WORKFLOW
    const initialStage = workflow.find(s => s.sequence === 1)!
    
    // Get workflow definition ID
    const workflowResult = await query<{ id: string }>(`
      SELECT id FROM bpm_workflow_definitions WHERE code = @code
    `, { code: entityType === 'contract' ? 'CONTRACTS_WORKFLOW' : 'CORRESPONDENCE_WORKFLOW' })
    
    const workflowId = workflowResult.recordset[0]?.id
    if (!workflowId) {
      throw new Error(`Workflow definition not found for ${entityType}`)
    }

    // Generate case number
    const caseNumber = await bpmCaseRepository.generateCaseNumber()

    // Calculate SLA due date
    const slaDueDate = this.calculateSLADueDate(initialStage.slaHours || 24)

    // Create case
    const bpmCase = await bpmCaseRepository.create({
      case_number: caseNumber,
      entity_type: entityType,
      entity_id: entityId,
      workflow_id: workflowId,
      current_stage_code: initialStage.code,
      case_status: 'OPEN',
      priority: options?.priority || 'normal',
      sla_due_date: slaDueDate,
      sla_status: 'on_track',
      current_owner_id: options?.ownerId,
      current_in_basket: initialStage.inBasket,
      opened_at: new Date(),
    } as Partial<BPMCase>)

    // Log activity
    await bpmActivityRepository.addActivity(
      bpmCase.id,
      'case_created',
      'Case created',
      'system',
      'system',
      { description: `Case ${caseNumber} created for ${entityType}` }
    )

    return bpmCase
  }

  /**
   * Execute a workflow action
   */
  async executeAction(
    caseId: string,
    actionCode: string,
    userId: string,
    options?: {
      note?: string
      assignToUserId?: string
      metadata?: Record<string, unknown>
    }
  ): Promise<BPMCase> {
    // Get case
    const bpmCase = await bpmCaseRepository.findById(caseId)
    if (!bpmCase) {
      throw new Error('Case not found')
    }

    // Get workflow
    const workflow = bpmCase.entity_type === 'contract' ? CONTRACTS_WORKFLOW : CORRESPONDENCE_WORKFLOW
    const currentStage = workflow.find(s => s.code === bpmCase.current_stage_code)
    if (!currentStage) {
      throw new Error('Invalid workflow stage')
    }

    // Find action
    const action = currentStage.actions.find(a => a.code === actionCode)
    if (!action) {
      throw new Error(`Action ${actionCode} not available in stage ${currentStage.code}`)
    }

    // Validate required fields
    if (action.requiresNote && !options?.note) {
      throw new Error('Note is required for this action')
    }
    if (action.requiresAssignment && !options?.assignToUserId) {
      throw new Error('Assignment is required for this action')
    }

    // Execute transition
    return await withTransaction(async () => {
      const previousStage = bpmCase.current_stage_code

      // Update case
      let updatedCase = bpmCase
      if (action.nextStage) {
        const nextStageConfig = workflow.find(s => s.code === action.nextStage)
        const newSlaDueDate = nextStageConfig?.slaHours 
          ? this.calculateSLADueDate(nextStageConfig.slaHours) 
          : bpmCase.sla_due_date

        updatedCase = await bpmCaseRepository.update(caseId, {
          current_stage_code: action.nextStage,
          current_in_basket: nextStageConfig?.inBasket || bpmCase.current_in_basket,
          current_owner_id: options?.assignToUserId || bpmCase.current_owner_id,
          case_status: action.nextStatus === 'CLOSED' || action.nextStatus === 'CANCELLED' 
            ? 'COMPLETED' as CaseStatus 
            : 'IN_PROGRESS' as CaseStatus,
          sla_due_date: newSlaDueDate,
        })
      }

      // Update underlying entity
      if (action.nextStatus) {
        await this.updateEntityStatus(bpmCase.entity_type, bpmCase.entity_id, action.nextStatus, action.nextStage)
      }

      // Assign if needed
      if (options?.assignToUserId) {
        await bpmCaseRepository.assignOwner(caseId, options.assignToUserId)
        if (!bpmCase.first_response_at) {
          await bpmCaseRepository.update(caseId, { first_response_at: new Date() })
        }
      }

      // Log workflow history
      await query(`
        INSERT INTO bpm_case_workflow_history (id, case_id, from_stage_code, to_stage_code, performed_by_id, action_type, notes)
        VALUES (NEWID(), @caseId, @fromStage, @toStage, @userId, @actionType, @notes)
      `, {
        caseId,
        fromStage: previousStage,
        toStage: action.nextStage || previousStage,
        userId,
        actionType: 'stage_transition',
        notes: options?.note,
      })

      // Log activity
      await bpmActivityRepository.addActivity(
        caseId,
        'action_executed',
        `Action: ${action.name}`,
        userId,
        'staff',
        { 
          description: options?.note,
          metadata: { actionCode, previousStage, newStage: action.nextStage }
        }
      )

      return updatedCase
    })
  }

  /**
   * Get available actions for a case
   */
  async getAvailableActions(caseId: string, userRoles: string[]): Promise<WorkflowAction[]> {
    const bpmCase = await bpmCaseRepository.findById(caseId)
    if (!bpmCase) {
      return []
    }

    const workflow = bpmCase.entity_type === 'contract' ? CONTRACTS_WORKFLOW : CORRESPONDENCE_WORKFLOW
    const currentStage = workflow.find(s => s.code === bpmCase.current_stage_code)
    if (!currentStage) {
      return []
    }

    // Filter actions by user roles
    return currentStage.actions.filter(action => 
      action.allowedRoles.some(role => userRoles.includes(role))
    )
  }

  /**
   * Get workflow stage configuration
   */
  getWorkflowStage(entityType: 'correspondence' | 'contract', stageCode: string): WorkflowStage | undefined {
    const workflow = entityType === 'contract' ? CONTRACTS_WORKFLOW : CORRESPONDENCE_WORKFLOW
    return workflow.find(s => s.code === stageCode)
  }

  /**
   * Get full workflow definition
   */
  getWorkflow(entityType: 'correspondence' | 'contract'): WorkflowStage[] {
    return entityType === 'contract' ? CONTRACTS_WORKFLOW : CORRESPONDENCE_WORKFLOW
  }

  /**
   * Calculate SLA due date considering business hours and holidays
   */
  private calculateSLADueDate(slaHours: number): Date {
    const now = new Date()
    const businessHoursPerDay = 8
    const daysToAdd = Math.ceil(slaHours / businessHoursPerDay)
    
    const dueDate = new Date(now)
    let addedDays = 0
    
    while (addedDays < daysToAdd) {
      dueDate.setDate(dueDate.getDate() + 1)
      const dayOfWeek = dueDate.getDay()
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++
      }
    }

    return dueDate
  }

  /**
   * Update the underlying entity (correspondence or contract) status
   */
  private async updateEntityStatus(
    entityType: 'correspondence' | 'contract',
    entityId: string,
    status: string,
    stage?: string
  ): Promise<void> {
    if (entityType === 'correspondence') {
      await correspondenceRepository.updateWorkflowState(
        entityId,
        (stage || 'PROCESSING') as CorrespondenceWorkflowStage,
        status as CorrespondenceStatus
      )
    } else {
      await contractsRepository.updateWorkflowState(
        entityId,
        (stage || 'DRAFT') as ContractWorkflowStage,
        status as ContractStatus
      )
    }
  }

  /**
   * Update SLA status for all open cases
   */
  async updateSLAStatuses(): Promise<void> {
    const now = new Date()
    const warningThreshold = 0.75 // 75% of time elapsed

    await query(`
      UPDATE bpm_cases
      SET sla_status = CASE
        WHEN sla_due_date < @now THEN 'breached'
        WHEN DATEDIFF(MINUTE, opened_at, @now) > DATEDIFF(MINUTE, opened_at, sla_due_date) * @threshold THEN 'at_risk'
        ELSE 'on_track'
      END,
      updated_at = @now
      WHERE case_status NOT IN ('COMPLETED', 'CANCELLED')
        AND sla_due_date IS NOT NULL
    `, { now, threshold: warningThreshold })
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine()
