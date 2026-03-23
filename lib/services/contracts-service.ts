import { ContractsRepository } from '@/lib/db/repositories/contracts-repository'
import { BPMCaseRepository } from '@/lib/db/repositories/bpm-case-repository'
import { WorkflowEngine } from '@/lib/services/workflow-engine'
import { Contract, BPMCase, ContractStatus } from '@/lib/types/database'

export interface CreateContractInput {
  typeId: string
  title: string
  description: string
  contractNumber?: string
  contractValue: number
  currency: string
  startDate: Date
  endDate: Date
  procurementMethod: string
  fundingSource?: string
  submitterId: string
  organizationId: string
  contractor: {
    name: string
    tradingName?: string
    registrationNumber?: string
    taxId?: string
    contactPerson: string
    email: string
    phone?: string
    address: string
  }
}

export interface AssignContractInput {
  contractId: string
  assignedOfficerId: string
  assignedById: string
  notes?: string
}

export interface SubmitDraftInput {
  contractId: string
  officerId: string
  draftDocumentId: string
  draftNotes?: string
}

export interface MinistryReviewInput {
  contractId: string
  officerId: string
  action: 'send_to_ministry' | 'ministry_returned' | 'ministry_approved'
  comments?: string
}

export interface SignatureInput {
  contractId: string
  signerId: string
  signatureType: 'sg_signature' | 'ministry_signature' | 'counterparty_signature'
  signatureDocumentId?: string
  signedDate: Date
}

export interface AdjudicationInput {
  contractId: string
  officerId: string
  adjudicationDate: Date
  adjudicationReference?: string
  stampDutyPaid?: number
  notes?: string
}

export class ContractsService {
  private contractsRepo: ContractsRepository
  private bpmCaseRepo: BPMCaseRepository
  private workflowEngine: WorkflowEngine

  constructor() {
    this.contractsRepo = new ContractsRepository()
    this.bpmCaseRepo = new BPMCaseRepository()
    this.workflowEngine = new WorkflowEngine()
  }

  /**
   * Submit new contract from public portal (Post-Award)
   */
  async submitContract(input: CreateContractInput): Promise<{ contract: Contract; bpmCase: BPMCase }> {
    // Generate reference number
    const referenceNumber = await this.generateReferenceNumber()

    // Create contract record
    const contract = await this.contractsRepo.create({
      reference_number: referenceNumber,
      type_id: input.typeId,
      title: input.title,
      description: input.description,
      contract_number: input.contractNumber,
      contract_value: input.contractValue,
      currency: input.currency,
      start_date: input.startDate,
      end_date: input.endDate,
      procurement_method: input.procurementMethod,
      funding_source: input.fundingSource,
      submitter_id: input.submitterId,
      organization_id: input.organizationId,
      status: 'intake',
      submitted_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    })

    // Add contractor party
    await this.contractsRepo.addParty({
      contract_id: contract.id,
      party_type: 'contractor',
      party_category: 'company',
      name: input.contractor.name,
      trading_name: input.contractor.tradingName,
      registration_number: input.contractor.registrationNumber,
      tax_id: input.contractor.taxId,
      contact_person: input.contractor.contactPerson,
      email: input.contractor.email,
      phone: input.contractor.phone,
      address: input.contractor.address
    })

    // Create BPM case for workflow tracking
    const bpmCase = await this.bpmCaseRepo.createCase({
      caseType: 'contract',
      entityId: contract.id,
      referenceNumber: referenceNumber,
      currentStage: 'INTAKE',
      currentStatus: 'intake',
      priority: input.contractValue > 1000000 ? 'high' : 'normal',
      submitterId: input.submitterId,
      organizationId: input.organizationId
    })

    // Initialize workflow
    await this.workflowEngine.initializeWorkflow(bpmCase.id, 'contract')

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'submission',
      description: 'Post-award contract submitted via portal',
      performedById: input.submitterId,
      performedByType: 'public_user',
      metadata: { contractValue: input.contractValue, contractType: input.typeId }
    })

    // Create intake task for Contracts Intake Officer
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'contract_intake',
      title: `Intake: ${contract.title}`,
      description: 'Validate and process new contract submission',
      assignedToRole: 'contracts_intake_officer',
      priority: 'normal',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    })

    return { contract, bpmCase }
  }

  /**
   * Contracts Intake Officer processes intake
   */
  async processIntake(contractId: string, intakeOfficerId: string, intakeData: {
    validated: boolean
    intakeNotes?: string
    natureOfContract?: string
    contractCategory?: string
    instrumentType?: string
  }): Promise<Contract> {
    const contract = await this.contractsRepo.findById(contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    if (!intakeData.validated) {
      // Return to MDA for corrections
      await this.updateStatus(contractId, 'returned_corr', intakeOfficerId, intakeData.intakeNotes || 'Submission requires corrections')
      return contract
    }

    // Update contract with intake data
    await this.contractsRepo.update(contractId, {
      intake_clerk_id: intakeOfficerId,
      received_at: new Date(),
      nature_of_contract: intakeData.natureOfContract,
      contract_category: intakeData.contractCategory,
      instrument_type: intakeData.instrumentType,
      updated_at: new Date()
    })

    // Advance workflow to ASSIGN stage
    await this.workflowEngine.advanceStage(bpmCase.id, 'ASSIGN', intakeOfficerId, 'staff')

    // Update status
    await this.updateStatus(contractId, 'pending_assignment', intakeOfficerId, 'Intake validation completed')

    // Complete intake task
    const intakeTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'contract_intake')
    if (intakeTask) {
      await this.bpmCaseRepo.completeTask(intakeTask.id, intakeOfficerId)
    }

    // Create assignment task for DSG/Supervisor
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'assign_officer',
      title: `Assign: ${contract.title}`,
      description: 'Assign Legal Officer to draft/review contract',
      assignedToRole: 'dsg',
      priority: 'normal',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    })

    return await this.contractsRepo.findById(contractId) as Contract
  }

  /**
   * DSG/Supervisor assigns contract to Legal Officer
   */
  async assignToOfficer(input: AssignContractInput): Promise<Contract> {
    const contract = await this.contractsRepo.findById(input.contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', input.contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Update contract with assignment
    await this.contractsRepo.update(input.contractId, {
      assigned_officer_id: input.assignedOfficerId,
      assigned_at: new Date(),
      updated_at: new Date()
    })

    // Update BPM case
    await this.bpmCaseRepo.update(bpmCase.id, {
      assigned_to_id: input.assignedOfficerId,
      assigned_at: new Date()
    })

    // Advance workflow to DRAFT stage
    await this.workflowEngine.advanceStage(bpmCase.id, 'DRAFT', input.assignedById, 'staff')

    // Update status
    await this.updateStatus(input.contractId, 'assigned', input.assignedById, 'Assigned to Legal Officer')

    // Complete assignment task
    const assignTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'assign_officer')
    if (assignTask) {
      await this.bpmCaseRepo.completeTask(assignTask.id, input.assignedById)
    }

    // Create drafting task
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'draft_contract',
      title: `Draft: ${contract.title}`,
      description: 'Draft/review contract document',
      assignedToId: input.assignedOfficerId,
      priority: 'normal',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'assignment',
      description: 'Contract assigned to Legal Officer for drafting',
      performedById: input.assignedById,
      performedByType: 'staff',
      metadata: { assignedOfficerId: input.assignedOfficerId }
    })

    return await this.contractsRepo.findById(input.contractId) as Contract
  }

  /**
   * Legal Officer submits draft for supervisor review
   */
  async submitDraft(input: SubmitDraftInput): Promise<Contract> {
    const contract = await this.contractsRepo.findById(input.contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', input.contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Update contract
    await this.contractsRepo.update(input.contractId, {
      current_draft_id: input.draftDocumentId,
      draft_submitted_at: new Date(),
      updated_at: new Date()
    })

    // Update status to supervisor review
    await this.updateStatus(input.contractId, 'sup_review', input.officerId, 'Draft submitted for supervisor review')

    // Complete drafting task
    const draftTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'draft_contract')
    if (draftTask) {
      await this.bpmCaseRepo.completeTask(draftTask.id, input.officerId)
    }

    // Create supervisor review task
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'supervisor_review',
      title: `Review Draft: ${contract.title}`,
      description: 'Review contract draft before sending to Ministry',
      assignedToRole: 'senior_legal_officer',
      priority: 'normal',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    })

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'draft_submission',
      description: 'Contract draft submitted for internal review',
      performedById: input.officerId,
      performedByType: 'staff',
      metadata: { draftDocumentId: input.draftDocumentId, notes: input.draftNotes }
    })

    return await this.contractsRepo.findById(input.contractId) as Contract
  }

  /**
   * Supervisor approves draft and sends to Ministry
   */
  async supervisorApproval(contractId: string, supervisorId: string, approved: boolean, comments?: string): Promise<Contract> {
    const contract = await this.contractsRepo.findById(contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Complete supervisor review task
    const reviewTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'supervisor_review')
    if (reviewTask) {
      await this.bpmCaseRepo.completeTask(reviewTask.id, supervisorId)
    }

    if (approved) {
      // Advance to MIN_REVIEW stage
      await this.workflowEngine.advanceStage(bpmCase.id, 'MIN_REVIEW', supervisorId, 'staff')

      await this.updateStatus(contractId, 'sent_mda', supervisorId, 'Contract sent to Ministry for review')

      // Create task for Ministry review
      await this.bpmCaseRepo.createTask({
        caseId: bpmCase.id,
        taskType: 'ministry_review',
        title: `Ministry Review: ${contract.title}`,
        description: 'Awaiting Ministry feedback on contract draft',
        assignedToId: contract.assigned_officer_id!,
        priority: 'normal',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      })

      // Log activity
      await this.bpmCaseRepo.addActivity({
        caseId: bpmCase.id,
        activityType: 'external_send',
        description: 'Contract draft sent to Ministry for review',
        performedById: supervisorId,
        performedByType: 'staff'
      })
    } else {
      // Return to officer for revision
      await this.updateStatus(contractId, 'drafting', supervisorId, comments || 'Draft requires revision')

      // Create revision task
      await this.bpmCaseRepo.createTask({
        caseId: bpmCase.id,
        taskType: 'revise_draft',
        title: `Revise Draft: ${contract.title}`,
        description: comments || 'Draft requires revision per supervisor feedback',
        assignedToId: contract.assigned_officer_id!,
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      })
    }

    return await this.contractsRepo.findById(contractId) as Contract
  }

  /**
   * Process Ministry review response
   */
  async processMinistryReview(input: MinistryReviewInput): Promise<Contract> {
    const contract = await this.contractsRepo.findById(input.contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', input.contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Complete ministry review task
    const reviewTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'ministry_review')
    if (reviewTask) {
      await this.bpmCaseRepo.completeTask(reviewTask.id, input.officerId)
    }

    switch (input.action) {
      case 'ministry_approved':
        // Advance to SIGN stage
        await this.workflowEngine.advanceStage(bpmCase.id, 'SIGN', input.officerId, 'staff')
        await this.updateStatus(input.contractId, 'final_sig', input.officerId, 'Ministry approved - ready for signatures')

        // Create signature task
        await this.bpmCaseRepo.createTask({
          caseId: bpmCase.id,
          taskType: 'obtain_signatures',
          title: `Signatures: ${contract.title}`,
          description: 'Obtain SG and Ministry signatures',
          assignedToId: contract.assigned_officer_id!,
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })
        break

      case 'ministry_returned':
        // Return to drafting
        await this.updateStatus(input.contractId, 'returned_mda', input.officerId, input.comments || 'Ministry returned with comments')

        // Create revision task
        await this.bpmCaseRepo.createTask({
          caseId: bpmCase.id,
          taskType: 'address_ministry_comments',
          title: `Address Comments: ${contract.title}`,
          description: input.comments || 'Address Ministry comments and resubmit',
          assignedToId: contract.assigned_officer_id!,
          priority: 'high',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
        })
        break
    }

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'ministry_response',
      description: `Ministry review: ${input.action}`,
      performedById: input.officerId,
      performedByType: 'staff',
      metadata: { action: input.action, comments: input.comments }
    })

    return await this.contractsRepo.findById(input.contractId) as Contract
  }

  /**
   * Record signature
   */
  async recordSignature(input: SignatureInput): Promise<Contract> {
    const contract = await this.contractsRepo.findById(input.contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', input.contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Record signature based on type
    const updates: any = { updated_at: new Date() }
    
    switch (input.signatureType) {
      case 'sg_signature':
        updates.sg_signed_by_id = input.signerId
        updates.sg_signed_at = input.signedDate
        break
      case 'ministry_signature':
        updates.ministry_signed_at = input.signedDate
        break
      case 'counterparty_signature':
        updates.counterparty_signed_at = input.signedDate
        break
    }

    await this.contractsRepo.update(input.contractId, updates)

    // Check if all signatures collected
    const updatedContract = await this.contractsRepo.findById(input.contractId) as Contract
    const allSigned = updatedContract.sg_signed_at && updatedContract.ministry_signed_at && updatedContract.counterparty_signed_at

    if (allSigned) {
      // Advance to ADJ stage
      await this.workflowEngine.advanceStage(bpmCase.id, 'ADJ', input.signerId, 'staff')
      await this.updateStatus(input.contractId, 'exec_adj', input.signerId, 'All signatures collected - ready for adjudication')

      // Complete signature task
      const sigTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'obtain_signatures')
      if (sigTask) {
        await this.bpmCaseRepo.completeTask(sigTask.id, input.signerId)
      }

      // Create adjudication task
      await this.bpmCaseRepo.createTask({
        caseId: bpmCase.id,
        taskType: 'adjudication',
        title: `Adjudicate: ${contract.title}`,
        description: 'Process contract at Supreme Court for adjudication',
        assignedToRole: 'legal_assistant',
        priority: 'normal',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      })
    }

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'signature',
      description: `Signature recorded: ${input.signatureType}`,
      performedById: input.signerId,
      performedByType: 'staff',
      metadata: { signatureType: input.signatureType, signedDate: input.signedDate }
    })

    return await this.contractsRepo.findById(input.contractId) as Contract
  }

  /**
   * Complete adjudication
   */
  async completeAdjudication(input: AdjudicationInput): Promise<Contract> {
    const contract = await this.contractsRepo.findById(input.contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', input.contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Update contract with adjudication details
    await this.contractsRepo.update(input.contractId, {
      adjudication_date: input.adjudicationDate,
      adjudication_reference: input.adjudicationReference,
      stamp_duty_paid: input.stampDutyPaid,
      updated_at: new Date()
    })

    // Advance to DISPATCH stage
    await this.workflowEngine.advanceStage(bpmCase.id, 'DISPATCH', input.officerId, 'staff')
    await this.updateStatus(input.contractId, 'adj_comp', input.officerId, 'Adjudication completed')

    // Complete adjudication task
    const adjTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'adjudication')
    if (adjTask) {
      await this.bpmCaseRepo.completeTask(adjTask.id, input.officerId)
    }

    // Create dispatch/closeout task
    await this.bpmCaseRepo.createTask({
      caseId: bpmCase.id,
      taskType: 'dispatch_closeout',
      title: `Dispatch: ${contract.title}`,
      description: 'Dispatch executed contract to Ministry and close case',
      assignedToRole: 'legal_assistant',
      priority: 'normal',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    })

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'adjudication',
      description: 'Contract adjudicated at Supreme Court',
      performedById: input.officerId,
      performedByType: 'staff',
      metadata: { adjudicationDate: input.adjudicationDate, reference: input.adjudicationReference }
    })

    return await this.contractsRepo.findById(input.contractId) as Contract
  }

  /**
   * Dispatch and close contract case
   */
  async dispatchAndClose(contractId: string, dispatcherId: string, dispatchData: {
    dispatchMethod: string
    dispatchNotes?: string
    copiesDispatched?: number
  }): Promise<Contract> {
    const contract = await this.contractsRepo.findById(contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', contractId)
    if (!bpmCase) {
      throw new Error('BPM case not found')
    }

    // Update contract
    await this.contractsRepo.update(contractId, {
      dispatch_date: new Date(),
      dispatch_method: dispatchData.dispatchMethod,
      updated_at: new Date()
    })

    // Close the case
    await this.workflowEngine.advanceStage(bpmCase.id, 'CLOSED', dispatcherId, 'staff')
    await this.updateStatus(contractId, 'closed', dispatcherId, 'Contract dispatched and case closed')

    // Close BPM case
    await this.bpmCaseRepo.update(bpmCase.id, {
      current_status: 'completed',
      closed_at: new Date(),
      closed_by_id: dispatcherId
    })

    // Complete dispatch task
    const dispatchTask = await this.bpmCaseRepo.findTaskByType(bpmCase.id, 'dispatch_closeout')
    if (dispatchTask) {
      await this.bpmCaseRepo.completeTask(dispatchTask.id, dispatcherId)
    }

    // Log activity
    await this.bpmCaseRepo.addActivity({
      caseId: bpmCase.id,
      activityType: 'dispatch',
      description: 'Contract dispatched and case closed',
      performedById: dispatcherId,
      performedByType: 'staff',
      metadata: dispatchData
    })

    return await this.contractsRepo.findById(contractId) as Contract
  }

  /**
   * Update contract status with history tracking
   */
  private async updateStatus(contractId: string, newStatus: ContractStatus, changedById: string, reason?: string): Promise<void> {
    const contract = await this.contractsRepo.findById(contractId)
    if (!contract) return

    const previousStatus = contract.status

    await this.contractsRepo.update(contractId, {
      status: newStatus,
      updated_at: new Date()
    })

    await this.contractsRepo.addStatusHistory({
      contract_id: contractId,
      from_status: previousStatus,
      to_status: newStatus,
      changed_by_id: changedById,
      reason
    })

    // Update BPM case
    const bpmCase = await this.bpmCaseRepo.findByEntityId('contract', contractId)
    if (bpmCase) {
      await this.bpmCaseRepo.update(bpmCase.id, {
        current_status: newStatus
      })
    }
  }

  /**
   * Get contract with full details
   */
  async getContractWithDetails(contractId: string): Promise<any> {
    const contract = await this.contractsRepo.findById(contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const [parties, deliverables, statusHistory, documents, reviews, issues, amendments, bpmCase] = await Promise.all([
      this.contractsRepo.getParties(contractId),
      this.contractsRepo.getDeliverables(contractId),
      this.contractsRepo.getStatusHistory(contractId),
      this.contractsRepo.getDocuments(contractId),
      this.contractsRepo.getReviews(contractId),
      this.contractsRepo.getIssues(contractId),
      this.contractsRepo.getAmendments(contractId),
      this.bpmCaseRepo.findByEntityId('contract', contractId)
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
      contract,
      parties,
      deliverables,
      statusHistory,
      documents,
      reviews,
      issues,
      amendments,
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
    contractType?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<any[]> {
    return this.contractsRepo.findByFilters({
      assignedOfficerId: staffUserId,
      ...filters
    })
  }

  /**
   * Get contracts by in-basket
   */
  async getInBasket(inBasketType: string): Promise<any[]> {
    const statusMap: Record<string, ContractStatus[]> = {
      'intake': ['intake'],
      'drafting': ['assigned', 'drafting'],
      'awaiting_approval': ['sup_review'],
      'with_ministry': ['sent_mda', 'returned_mda'],
      'adjudication': ['exec_adj'],
      'ready_close': ['adj_comp']
    }

    const statuses = statusMap[inBasketType] || []
    return this.contractsRepo.findByStatuses(statuses)
  }

  /**
   * Generate unique reference number
   */
  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.contractsRepo.countByYear(year)
    const sequence = (count + 1).toString().padStart(5, '0')
    return `CON-${year}-${sequence}`
  }
}

export const contractsService = new ContractsService()
