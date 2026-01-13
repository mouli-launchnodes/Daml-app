"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

// Types for DAML integration
export interface PartyInfo {
  id: string
  displayName: string
}

export interface AssetContract {
  contractId: string
  payload: {
    owner: string
    description: string
    createdAt: string
    observers: string[]
  }
}

export interface TransferProposalContract {
  contractId: string
  payload: {
    asset: {
      owner: string
      description: string
      createdAt: string
      observers: string[]
    }
    sender: string
    receiver: string
    proposedAt: string
  }
}

interface DamlContextType {
  party: PartyInfo | null
  setParty: (party: PartyInfo | null) => void
  isConnected: boolean
  assets: AssetContract[]
  proposals: TransferProposalContract[]
  createAsset: (description: string) => Promise<void>
  proposeTransfer: (contractId: string, newOwner: string) => Promise<void>
  acceptProposal: (contractId: string) => Promise<void>
  rejectProposal: (contractId: string) => Promise<void>
  cancelProposal: (contractId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const DamlContext = createContext<DamlContextType | undefined>(undefined)

// Configuration from environment
const LEDGER_ID = process.env.NEXT_PUBLIC_LEDGER_ID || "sandbox"
const JSON_API_URL = "/api/daml" // Use Next.js API proxy instead of direct DAML API

// Template IDs for DAML contracts (with package ID)
const ASSET_TEMPLATE_ID = "3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset"
const TRANSFER_PROPOSAL_TEMPLATE_ID = "3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:TransferProposal"

// Available parties for development (with proper Canton party IDs)
export const AVAILABLE_PARTIES: PartyInfo[] = [
  { id: "Alice::1220a82f9051f4828b80d8cf6620fba66562303f110452605ba6bb45381683dc7d49", displayName: "Alice" },
  { id: "Bob::1220a82f9051f4828b80d8cf6620fba66562303f110452605ba6bb45381683dc7d49", displayName: "Bob" },
  { id: "Charlie::1220a82f9051f4828b80d8cf6620fba66562303f110452605ba6bb45381683dc7d49", displayName: "Charlie" },
]

// Generate JWT token for party authentication (development only)
function generateToken(party: string): string {
  const header = { alg: "HS256", typ: "JWT" }
  const payload = {
    ledgerId: LEDGER_ID,
    applicationId: "asset-transfer-app",
    party: party,
    readAs: [party],
    actAs: [party],
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  }

  // For development - simple unsigned token
  const base64Header = btoa(JSON.stringify(header))
  const base64Payload = btoa(JSON.stringify(payload))
  return `${base64Header}.${base64Payload}.development-signature`
}

// HTTP helper function
async function damlRequest(endpoint: string, method: string, token: string, body?: any) {
  const response = await fetch(`${JSON_API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  return response.json()
}

export function DamlProvider({ children }: { children: React.ReactNode }) {
  const [party, setParty] = useState<PartyInfo | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [assets, setAssets] = useState<AssetContract[]>([])
  const [proposals, setProposals] = useState<TransferProposalContract[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Test connection and load data when party changes
  useEffect(() => {
    if (!party) {
      setIsConnected(false)
      setAssets([])
      setProposals([])
      return
    }

    const token = generateToken(party.id)
    
    // Test connection and load initial data
    const testConnection = async () => {
      try {
        // Test with a simple query
        await damlRequest('/v1/query', 'POST', token, {
          templateIds: [ASSET_TEMPLATE_ID]
        })
        
        console.log(`✅ Connected to DAML as ${party.id}`)
        setIsConnected(true)
        setError(null)
        
        // Load initial data
        await loadData()
      } catch (err) {
        console.error(`❌ DAML connection failed:`, err)
        setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsConnected(false)
      }
    }

    testConnection()
  }, [party])

  // Load assets and proposals
  const loadData = useCallback(async () => {
    if (!party) return

    const token = generateToken(party.id)
    
    try {
      // Load assets owned by current party
      const assetsResponse = await damlRequest('/v1/query', 'POST', token, {
        templateIds: [ASSET_TEMPLATE_ID],
        query: { owner: party.id }
      })
      
      // Validate and set assets
      const validAssets = (assetsResponse.result || []).filter((asset: any) => 
        asset && asset.contractId && asset.payload && asset.payload.description
      )
      setAssets(validAssets)

      // Load proposals where current party is receiver
      const proposalsResponse = await damlRequest('/v1/query', 'POST', token, {
        templateIds: [TRANSFER_PROPOSAL_TEMPLATE_ID],
        query: { receiver: party.id }
      })
      
      // Validate and set proposals
      const validProposals = (proposalsResponse.result || []).filter((proposal: any) => 
        proposal && proposal.contractId && proposal.payload && 
        proposal.payload.asset && proposal.payload.asset.description
      )
      setProposals(validProposals)

    } catch (err) {
      console.error('Failed to load data:', err)
      setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [party])

  const createAsset = useCallback(
    async (description: string) => {
      if (!party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        const token = generateToken(party.id)
        
        await damlRequest('/v1/create', 'POST', token, {
          templateId: ASSET_TEMPLATE_ID,
          payload: {
            owner: party.id,
            description,
            createdAt: new Date().toISOString(),
            observers: [],
          }
        })

        console.log(`✅ Created asset: ${description}`)
        
        // Wait a moment for the ledger to process, then refresh
        setTimeout(() => {
          loadData()
        }, 500)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create asset"
        console.error(`❌ Create asset failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [party, loadData],
  )

  const proposeTransfer = useCallback(
    async (contractId: string, newOwner: string) => {
      if (!party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        const token = generateToken(party.id)
        
        await damlRequest('/v1/exercise', 'POST', token, {
          templateId: ASSET_TEMPLATE_ID,
          contractId,
          choice: "ProposeTransfer",
          argument: {
            newOwner
          }
        })

        console.log(`✅ Proposed transfer to ${newOwner}`)
        
        // Wait a moment for the ledger to process, then refresh
        setTimeout(() => {
          loadData()
        }, 500)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to propose transfer"
        console.error(`❌ Propose transfer failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [party, loadData],
  )

  const acceptProposal = useCallback(
    async (contractId: string) => {
      if (!party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        const token = generateToken(party.id)
        
        await damlRequest('/v1/exercise', 'POST', token, {
          templateId: TRANSFER_PROPOSAL_TEMPLATE_ID,
          contractId,
          choice: "Accept",
          argument: {}
        })

        console.log(`✅ Accepted proposal`)
        
        // Wait a moment for the ledger to process, then refresh
        setTimeout(() => {
          loadData()
        }, 500)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to accept proposal"
        console.error(`❌ Accept proposal failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [party, loadData],
  )

  const rejectProposal = useCallback(
    async (contractId: string) => {
      if (!party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        const token = generateToken(party.id)
        
        await damlRequest('/v1/exercise', 'POST', token, {
          templateId: TRANSFER_PROPOSAL_TEMPLATE_ID,
          contractId,
          choice: "Reject",
          argument: {}
        })

        console.log(`✅ Rejected proposal`)
        
        // Wait a moment for the ledger to process, then refresh
        setTimeout(() => {
          loadData()
        }, 500)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to reject proposal"
        console.error(`❌ Reject proposal failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [party, loadData],
  )

  const cancelProposal = useCallback(
    async (contractId: string) => {
      if (!party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        const token = generateToken(party.id)
        
        await damlRequest('/v1/exercise', 'POST', token, {
          templateId: TRANSFER_PROPOSAL_TEMPLATE_ID,
          contractId,
          choice: "Cancel",
          argument: {}
        })

        console.log(`✅ Cancelled proposal`)
        await loadData() // Refresh data
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to cancel proposal"
        console.error(`❌ Cancel proposal failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [party, loadData],
  )

  return (
    <DamlContext.Provider
      value={{
        party,
        setParty,
        isConnected,
        assets,
        proposals,
        createAsset,
        proposeTransfer,
        acceptProposal,
        rejectProposal,
        cancelProposal,
        isLoading,
        error,
        clearError,
      }}
    >
      {children}
    </DamlContext.Provider>
  )
}

export function useDaml() {
  const context = useContext(DamlContext)
  if (context === undefined) {
    throw new Error("useDaml must be used within a DamlProvider")
  }
  return context
}