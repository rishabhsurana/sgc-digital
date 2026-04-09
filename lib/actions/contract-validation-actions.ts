"use server"

import { MOCK_CONTRACTS } from "@/lib/data/mock-data"

// Types for contract validation and prepopulation
export interface OriginalContractData {
  contractId: string
  referenceNumber: string
  contractTitle: string
  contractDescription: string
  scopeOfWork: string
  
  // Ministry/MDA
  ministry: string
  department: string
  
  // Contractor
  contractorType: string
  contractorName: string
  contractorAddress: string
  contractorCity: string
  contractorCountry: string
  contractorEmail: string
  contractorPhone: string
  companyRegistrationNumber: string
  taxIdentificationNumber: string
  
  // Contract Details
  contractNature: string
  contractCategory: string
  contractInstrument: string
  contractCurrency: string
  contractValue: string
  fundingSource: string
  procurementMethod: string
  contractStartDate: string
  contractEndDate: string
  contractDuration: string
  
  // Entity that owns this contract
  ownerEntityId: string
  ownerEntityNumber: string
  ownerEntityName: string
  
  // Renewal history
  renewalCount: number
  supplementalCount: number
  lastRenewalDate: string | null
  
  // Status
  status: string
  isActive: boolean
  canBeRenewed: boolean
  canHaveSupplemental: boolean
  expiryDate: string
  daysUntilExpiry: number
}

export interface ValidationResult {
  isValid: boolean
  contractData: OriginalContractData | null
  errors: string[]
  warnings: string[]
}

/**
 * Validates a contract/transaction number and returns the original contract data
 * for prepopulation in renewal/supplemental forms.
 * 
 * CRITICAL VALIDATIONS:
 * 1. Contract number exists in the system
 * 2. Contract belongs to the requesting entity
 * 3. Contract is in a status that allows renewal/supplemental
 * 4. Contract has not exceeded maximum renewal limit (if applicable)
 */
export async function validateOriginalContract(
  contractNumber: string,
  requestingEntityId: string,
  contractType: 'REN' | 'SUP'
): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Normalize the contract number (remove spaces, uppercase)
  const normalizedNumber = contractNumber.trim().toUpperCase()
  
  if (!normalizedNumber) {
    return {
      isValid: false,
      contractData: null,
      errors: ['Contract number is required'],
      warnings: []
    }
  }
  
  // Find the contract in the database (mock for now)
  const contract = MOCK_CONTRACTS.find(
    c => c.referenceNumber.toUpperCase() === normalizedNumber ||
         c.contractId.toUpperCase() === normalizedNumber
  )
  
  if (!contract) {
    return {
      isValid: false,
      contractData: null,
      errors: [`Contract number "${contractNumber}" was not found in the system. Please verify the number and try again.`],
      warnings: []
    }
  }
  
  // CRITICAL: Validate entity ownership
  // The contract must belong to the entity making the renewal/supplemental request
  if (contract.requestingEntityId !== requestingEntityId) {
    return {
      isValid: false,
      contractData: null,
      errors: [
        `This contract does not belong to your organization. ` +
        `Only the original contracting entity can submit ${contractType} requests.`
      ],
      warnings: []
    }
  }
  
  // Check contract status
  const validStatusesForRenewal = ['ACTIVE', 'EXECUTED', 'APPROVED', 'EXPIRING_SOON']
  const validStatusesForSupplemental = ['ACTIVE', 'EXECUTED', 'APPROVED']
  
  const validStatuses = contractType === 'REN' 
    ? validStatusesForRenewal 
    : validStatusesForSupplemental
  
  if (!validStatuses.includes(contract.status || '')) {
    return {
      isValid: false,
      contractData: null,
      errors: [
        `This contract cannot be ${contractType === 'REN' ? 'renewed' : 'supplemented'} ` +
        `because its current status is "${contract.status}". ` +
        `Only contracts with status ${validStatuses.join(', ')} can be processed.`
      ],
      warnings: []
    }
  }
  
  // Check if contract has expired (for renewals)
  const expiryDate = new Date(contract.expiryDate || contract.contractEndDate || new Date())
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (contractType === 'REN') {
    // Allow renewals up to 30 days after expiry
    if (daysUntilExpiry < -30) {
      errors.push(
        `This contract expired more than 30 days ago (${expiryDate.toLocaleDateString()}). ` +
        `A new contract must be created instead of a renewal.`
      )
    } else if (daysUntilExpiry < 0) {
      warnings.push(
        `This contract has already expired (${expiryDate.toLocaleDateString()}). ` +
        `Renewal is still possible but requires expedited processing.`
      )
    } else if (daysUntilExpiry <= 30) {
      warnings.push(
        `This contract expires in ${daysUntilExpiry} days. Immediate action recommended.`
      )
    }
    
    // Check maximum renewal limit
    const maxRenewals = contract.maxRenewals || 3
    if (contract.renewalCount && contract.renewalCount >= maxRenewals) {
      errors.push(
        `This contract has reached the maximum number of renewals (${maxRenewals}). ` +
        `A new procurement process must be initiated.`
      )
    }
  }
  
  // Check for pending renewals/supplementals
  if (contract.hasPendingRenewal && contractType === 'REN') {
    errors.push(
      `There is already a pending renewal request for this contract. ` +
      `Please check your dashboard or contact the assigned officer.`
    )
  }
  
  if (contract.hasPendingSupplemental && contractType === 'SUP') {
    warnings.push(
      `There is already a pending supplemental request for this contract. ` +
      `Please verify this is not a duplicate submission.`
    )
  }
  
  // Prepare the prepopulation data
  const contractData: OriginalContractData = {
    contractId: contract.contractId,
    referenceNumber: contract.referenceNumber,
    contractTitle: contract.contractTitle,
    contractDescription: contract.description || '',
    scopeOfWork: contract.scopeOfWork || '',
    
    ministry: contract.ministry || '',
    department: contract.department || '',
    
    contractorType: contract.contractorType || 'company',
    contractorName: contract.counterpartyName,
    contractorAddress: contract.counterpartyAddress || '',
    contractorCity: contract.counterpartyCity || '',
    contractorCountry: contract.counterpartyCountry || 'Barbados',
    contractorEmail: contract.counterpartyEmail || '',
    contractorPhone: contract.counterpartyPhone || '',
    companyRegistrationNumber: contract.companyRegistrationNumber || '',
    taxIdentificationNumber: contract.taxIdentificationNumber || '',
    
    contractNature: contract.contractNature || 'goods',
    contractCategory: contract.contractCategory || '',
    contractInstrument: contract.contractInstrument || '',
    contractCurrency: contract.currency || 'BBD',
    contractValue: contract.contractValue?.toString() || '',
    fundingSource: contract.fundingSource || 'budget',
    procurementMethod: contract.procurementMethod || 'open-tender',
    contractStartDate: contract.contractStartDate || '',
    contractEndDate: contract.contractEndDate || '',
    contractDuration: contract.duration || '',
    
    ownerEntityId: contract.requestingEntityId,
    ownerEntityNumber: contract.entityNumber || '',
    ownerEntityName: contract.requestingDepartment || '',
    
    renewalCount: contract.renewalCount || 0,
    supplementalCount: contract.supplementalCount || 0,
    lastRenewalDate: contract.lastRenewalDate || null,
    
    status: contract.status || '',
    isActive: ['ACTIVE', 'EXECUTED', 'APPROVED'].includes(contract.status || ''),
    canBeRenewed: errors.length === 0 && contractType === 'REN',
    canHaveSupplemental: errors.length === 0 && contractType === 'SUP',
    expiryDate: expiryDate.toISOString().split('T')[0],
    daysUntilExpiry
  }
  
  return {
    isValid: errors.length === 0,
    contractData,
    errors,
    warnings
  }
}

/**
 * Get contracts owned by an entity that are eligible for renewal
 */
export async function getEntityContractsForRenewal(
  entityId: string
): Promise<{ contracts: Array<{ value: string; label: string; expiryDate: string; daysUntilExpiry: number }> }> {
  // Filter contracts that belong to this entity and can be renewed
  const eligibleContracts = MOCK_CONTRACTS
    .filter(c => {
      if (c.requestingEntityId !== entityId) return false
      if (!['ACTIVE', 'EXECUTED', 'APPROVED', 'EXPIRING_SOON'].includes(c.status || '')) return false
      if (c.renewalCount && c.renewalCount >= (c.maxRenewals || 3)) return false
      return true
    })
    .map(c => {
      const expiryDate = new Date(c.expiryDate || c.contractEndDate || new Date())
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return {
        value: c.referenceNumber,
        label: `${c.referenceNumber} - ${c.contractTitle}`,
        expiryDate: expiryDate.toISOString().split('T')[0],
        daysUntilExpiry
      }
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry) // Show expiring soonest first
  
  return { contracts: eligibleContracts }
}

/**
 * Get contracts owned by an entity that are eligible for supplemental
 */
export async function getEntityContractsForSupplemental(
  entityId: string
): Promise<{ contracts: Array<{ value: string; label: string; currentValue: string }> }> {
  const eligibleContracts = MOCK_CONTRACTS
    .filter(c => {
      if (c.requestingEntityId !== entityId) return false
      if (!['ACTIVE', 'EXECUTED', 'APPROVED'].includes(c.status || '')) return false
      return true
    })
    .map(c => ({
      value: c.referenceNumber,
      label: `${c.referenceNumber} - ${c.contractTitle}`,
      currentValue: `${c.currency || 'BBD'} ${c.contractValue?.toLocaleString() || '0'}`
    }))
  
  return { contracts: eligibleContracts }
}

/**
 * Validate that user/entity is authorized to submit for a specific ministry/department
 */
export async function validateEntityAuthorization(
  userId: string,
  entityId: string,
  targetMinistry: string,
  targetDepartment: string
): Promise<{ isAuthorized: boolean; message: string }> {
  // TODO: Implement actual authorization check
  // For now, return true for demo purposes
  return {
    isAuthorized: true,
    message: 'Authorization confirmed'
  }
}
