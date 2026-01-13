"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

// Types for DAML integration
export interface Party {
  id: string
  displayName: string
}

export interface Asset {
  contractId: string
  owner: string
  description: string
  observers: string[]
}

export interface TransferProposal {
  contractId: string
  asset: Asset
  sender: string
  receiver: string
}

interface DamlContextType {
  party: Party | null
  setParty: (party: Party | null) => void
  isConnected: boolean
  assets: Asset[]
  proposals: TransferProposal[]
  createAsset: (description: string) => Promise<void>
  proposeTransfer: (contractId: string, newOwner: string) => Promise<void>
  acceptProposal: (contractId: string) => Promise<void>
  rejectProposal: (contractId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const DamlContext = createContext<DamlContextType | undefined>(undefined)

const LEDGER_ID = process.env.NEXT_PUBLIC_LEDGER_ID || "sandbox"
const JSON_API_URL = process.env.NEXT_PUBLIC_JSON_API_URL || "http://127.0.0.1:7575"

// Available parties for development
export const AVAILABLE_PARTIES: Party[] = [
  { id: "Alice", displayName: "Alice" },
  { id: "Bob", displayName: "Bob" },
  { id: "Charlie", displayName: "Charlie" },
]

// Generate JWT token for party authentication
function generateToken(party: string): string {
  const header = { alg: "HS256", typ: "JWT" }
  const payload = {
    ledgerId: LEDGER_ID,
    applicationId: "asset-transfer-app",
    party: party,
    readAs: [party],
    actAs: [party],
  }

  // For development, we create a simple unsigned token
  // In production, this should be properly signed by the auth service
  const base64Header = btoa(JSON.stringify(header))
  const base64Payload = btoa(JSON.stringify(payload))
  return `${base64Header}.${base64Payload}.development-signature`
}

export function DamlProvider({ children }: { children: React.ReactNode }) {
  const [party, setParty] = useState<Party | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [proposals, setProposals] = useState<TransferProposal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Simulate WebSocket streaming for real-time updates
  useEffect(() => {
    if (!party) {
      setAssets([])
      setProposals([])
      setIsConnected(false)
      return
    }

    setIsConnected(true)

    // Load initial data from localStorage (simulating ledger queries)
    const storedAssets = localStorage.getItem("daml-assets")
    const storedProposals = localStorage.getItem("daml-proposals")

    if (storedAssets) {
      const allAssets: Asset[] = JSON.parse(storedAssets)
      setAssets(allAssets.filter((a) => a.owner === party.id))
    }

    if (storedProposals) {
      const allProposals: TransferProposal[] = JSON.parse(storedProposals)
      setProposals(allProposals.filter((p) => p.receiver === party.id))
    }

    // Set up storage event listener for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "daml-assets" && e.newValue) {
        const allAssets: Asset[] = JSON.parse(e.newValue)
        setAssets(allAssets.filter((a) => a.owner === party.id))
      }
      if (e.key === "daml-proposals" && e.newValue) {
        const allProposals: TransferProposal[] = JSON.parse(e.newValue)
        setProposals(allProposals.filter((p) => p.receiver === party.id))
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [party])

  // Refresh data after mutations
  const refreshData = useCallback(() => {
    if (!party) return

    const storedAssets = localStorage.getItem("daml-assets")
    const storedProposals = localStorage.getItem("daml-proposals")

    if (storedAssets) {
      const allAssets: Asset[] = JSON.parse(storedAssets)
      setAssets(allAssets.filter((a) => a.owner === party.id))
    } else {
      setAssets([])
    }

    if (storedProposals) {
      const allProposals: TransferProposal[] = JSON.parse(storedProposals)
      setProposals(allProposals.filter((p) => p.receiver === party.id))
    } else {
      setProposals([])
    }
  }, [party])

  const createAsset = useCallback(
    async (description: string) => {
      if (!party) throw new Error("Not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const newAsset: Asset = {
          contractId: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          owner: party.id,
          description,
          observers: [],
        }

        const storedAssets = localStorage.getItem("daml-assets")
        const allAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : []
        allAssets.push(newAsset)
        localStorage.setItem("daml-assets", JSON.stringify(allAssets))

        refreshData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create asset")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [party, refreshData],
  )

  const proposeTransfer = useCallback(
    async (contractId: string, newOwner: string) => {
      if (!party) throw new Error("Not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const storedAssets = localStorage.getItem("daml-assets")
        const allAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : []
        const asset = allAssets.find((a) => a.contractId === contractId)

        if (!asset) throw new Error("Asset not found")
        if (asset.owner !== party.id) throw new Error("Not authorized to transfer this asset")

        const proposal: TransferProposal = {
          contractId: `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          asset,
          sender: party.id,
          receiver: newOwner,
        }

        const storedProposals = localStorage.getItem("daml-proposals")
        const allProposals: TransferProposal[] = storedProposals ? JSON.parse(storedProposals) : []
        allProposals.push(proposal)
        localStorage.setItem("daml-proposals", JSON.stringify(allProposals))

        // Remove asset from sender's list (it's now in escrow)
        const updatedAssets = allAssets.filter((a) => a.contractId !== contractId)
        localStorage.setItem("daml-assets", JSON.stringify(updatedAssets))

        refreshData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to propose transfer")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [party, refreshData],
  )

  const acceptProposal = useCallback(
    async (contractId: string) => {
      if (!party) throw new Error("Not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const storedProposals = localStorage.getItem("daml-proposals")
        const allProposals: TransferProposal[] = storedProposals ? JSON.parse(storedProposals) : []
        const proposal = allProposals.find((p) => p.contractId === contractId)

        if (!proposal) throw new Error("Proposal not found")
        if (proposal.receiver !== party.id) throw new Error("Not authorized to accept this proposal")

        // Transfer asset to new owner
        const newAsset: Asset = {
          ...proposal.asset,
          contractId: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          owner: party.id,
        }

        const storedAssets = localStorage.getItem("daml-assets")
        const allAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : []
        allAssets.push(newAsset)
        localStorage.setItem("daml-assets", JSON.stringify(allAssets))

        // Remove proposal
        const updatedProposals = allProposals.filter((p) => p.contractId !== contractId)
        localStorage.setItem("daml-proposals", JSON.stringify(updatedProposals))

        refreshData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept proposal")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [party, refreshData],
  )

  const rejectProposal = useCallback(
    async (contractId: string) => {
      if (!party) throw new Error("Not authenticated")

      setIsLoading(true)
      setError(null)

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const storedProposals = localStorage.getItem("daml-proposals")
        const allProposals: TransferProposal[] = storedProposals ? JSON.parse(storedProposals) : []
        const proposal = allProposals.find((p) => p.contractId === contractId)

        if (!proposal) throw new Error("Proposal not found")
        if (proposal.receiver !== party.id) throw new Error("Not authorized to reject this proposal")

        // Return asset to original owner
        const returnedAsset: Asset = {
          ...proposal.asset,
          contractId: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }

        const storedAssets = localStorage.getItem("daml-assets")
        const allAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : []
        allAssets.push(returnedAsset)
        localStorage.setItem("daml-assets", JSON.stringify(allAssets))

        // Remove proposal
        const updatedProposals = allProposals.filter((p) => p.contractId !== contractId)
        localStorage.setItem("daml-proposals", JSON.stringify(updatedProposals))

        refreshData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reject proposal")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [party, refreshData],
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
