"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { DamlLedger } from "@daml/ledger"
import { Party, ContractId } from "@daml/types"

// Import generated DAML bindings
import { Asset, TransferProposal } from "../daml.js/asset-transfer-app-1.0.0/lib/Main"

// Types for DAML integration
export interface PartyInfo {
  id: string
  displayName: string
}

export interface AssetContract {
  contractId: ContractId<Asset>
  payload: Asset
}

export interface TransferProposalContract {
  contractId: ContractId<TransferProposal>
  payload: TransferProposal
}

interface DamlContextType {
  party: PartyInfo | null
  setParty: (party: PartyInfo | null) => void
  isConnected: boolean
  assets: AssetContract[]
  proposals: TransferProposalContract[]
  createAsset: (description: string) => Promise<void>
  proposeTransfer: (contractId: ContractId<Asset>, newOwner: string) => Promise<void>
  acceptProposal: (contractId: ContractId<TransferProposal>) => Promise<void>
  rejectProposal: (contractId: ContractId<TransferProposal>) => Promise<void>
  cancelProposal: (contractId: ContractId<TransferProposal>) => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const DamlContext = createContext<DamlContextType | undefined>(undefined)

// Configuration from environment
const LEDGER_ID = process.env.NEXT_PUBLIC_LEDGER_ID || "sandbox"
const JSON_API_URL = process.env.NEXT_PUBLIC_JSON_API_URL || "http://127.0.0.1:7575"
const WS_API_URL = JSON_API_URL.replace('http', 'ws')

// Available parties for development
export const AVAILABLE_PARTIES: PartyInfo[] = [
  { id: "Alice", displayName: "Alice" },
  { id: "Bob", displayName: "Bob" },
  { id: "Charlie", displayName: "Charlie" },
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

  // For development with --allow-insecure-tokens
  const base64Header = btoa(JSON.stringify(header))
  const base64Payload = btoa(JSON.stringify(payload))
  return `${base64Header}.${base64Payload}.development-signature`
}

export function DamlProvider({ children }: { children: React.ReactNode }) {
  const [party, setParty] = useState<PartyInfo | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [assets, setAssets] = useState<AssetContract[]>([])
  const [proposals, setProposals] = useState<TransferProposalContract[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ledger, setLedger] = useState<DamlLedger | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Initialize DAML Ledger connection
  useEffect(() => {
    if (!party) {
      setLedger(null)
      setIsConnected(false)
      setAssets([])
      setProposals([])
      return
    }

    const token = generateToken(party.id)
    
    const newLedger = new DamlLedger({
      token,
      httpBaseUrl: JSON_API_URL,
      wsBaseUrl: WS_API_URL,
    })

    setLedger(newLedger)
    setIsConnected(true)

    // Test connection
    newLedger.query(Asset)
      .then(() => {
        console.log(`✅ Connected to DAML as ${party.id}`)
        setError(null)
      })
      .catch((err) => {
        console.error(`❌ DAML connection failed:`, err)
        setError(`Connection failed: ${err.message}`)
        setIsConnected(false)
      })

    return () => {
      // Cleanup connection
      setLedger(null)
      setIsConnected(false)
    }
  }, [party])

  // Real-time asset queries
  useEffect(() => {
    if (!ledger || !party) return

    let assetStream: any
    let proposalStream: any

    const setupStreams = async () => {
      try {
        // Stream assets owned by current party
        assetStream = ledger.streamQueries(Asset, [{ owner: party.id }])
        assetStream.on('change', (contracts: AssetContract[]) => {
          setAssets(contracts)
        })

        // Stream proposals where current party is receiver
        proposalStream = ledger.streamQueries(TransferProposal, [{ receiver: party.id }])
        proposalStream.on('change', (contracts: TransferProposalContract[]) => {
          setProposals(contracts)
        })

        // Also stream proposals where current party is sender (for cancellation)
        const senderProposalStream = ledger.streamQueries(TransferProposal, [{ sender: party.id }])
        senderProposalStream.on('change', (contracts: TransferProposalContract[]) => {
          // Merge with receiver proposals (avoid duplicates)
          setProposals(prev => {
            const receiverIds = new Set(prev.map(p => p.contractId))
            const senderProposals = contracts.filter(p => !receiverIds.has(p.contractId))
            return [...prev, ...senderProposals]
          })
        })

      } catch (err) {
        console.error('Stream setup failed:', err)
        setError(`Stream setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    setupStreams()

    return () => {
      if (assetStream) assetStream.close()
      if (proposalStream) proposalStream.close()
    }
  }, [ledger, party])

  const createAsset = useCallback(
    async (description: string) => {
      if (!ledger || !party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        const assetData: Asset = {
          owner: party.id as Party,
          description,
          createdAt: new Date().toISOString(),
          observers: [],
        }

        await ledger.create(Asset, assetData)
        console.log(`✅ Created asset: ${description}`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create asset"
        console.error(`❌ Create asset failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [ledger, party],
  )

  const proposeTransfer = useCallback(
    async (contractId: ContractId<Asset>, newOwner: string) => {
      if (!ledger || !party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        await ledger.exercise(Asset.ProposeTransfer, contractId, {
          newOwner: newOwner as Party,
        })
        console.log(`✅ Proposed transfer to ${newOwner}`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to propose transfer"
        console.error(`❌ Propose transfer failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [ledger, party],
  )

  const acceptProposal = useCallback(
    async (contractId: ContractId<TransferProposal>) => {
      if (!ledger || !party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        await ledger.exercise(TransferProposal.Accept, contractId, {})
        console.log(`✅ Accepted proposal`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to accept proposal"
        console.error(`❌ Accept proposal failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [ledger, party],
  )

  const rejectProposal = useCallback(
    async (contractId: ContractId<TransferProposal>) => {
      if (!ledger || !party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        await ledger.exercise(TransferProposal.Reject, contractId, {})
        console.log(`✅ Rejected proposal`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to reject proposal"
        console.error(`❌ Reject proposal failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [ledger, party],
  )

  const cancelProposal = useCallback(
    async (contractId: ContractId<TransferProposal>) => {
      if (!ledger || !party) throw new Error("Not connected to DAML")

      setIsLoading(true)
      setError(null)

      try {
        await ledger.exercise(TransferProposal.Cancel, contractId, {})
        console.log(`✅ Cancelled proposal`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to cancel proposal"
        console.error(`❌ Cancel proposal failed:`, err)
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [ledger, party],
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