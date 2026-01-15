"use client"

import { useDaml, AVAILABLE_PARTIES } from "@/context/daml-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileCheck, Check, X, Inbox, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"

export function ProposalList() {
  const { proposals, acceptProposal, rejectProposal, isLoading } = useDaml()
  const { toast } = useToast()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAccept = async (contractId: string) => {
    setProcessingId(contractId)
    try {
      await acceptProposal(contractId)
      toast({
        title: "Proposal Accepted",
        description: "The asset has been transferred to your account",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept proposal",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (contractId: string) => {
    setProcessingId(contractId)
    try {
      await rejectProposal(contractId)
      toast({
        title: "Proposal Rejected",
        description: "The asset has been returned to the sender",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject proposal",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading && proposals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Incoming Proposals
          </CardTitle>
          <CardDescription>Transfer requests awaiting your response</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Incoming Proposals
          {proposals.length > 0 && (
            <Badge variant="default" className="ml-2">
              {proposals.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Transfer requests awaiting your response</CardDescription>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No pending proposals</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll see transfer requests from other parties here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal) => {
              const senderDisplayName = AVAILABLE_PARTIES.find(p => p.id === proposal.payload.sender)?.displayName || proposal.payload.sender.split("::")[0]
              
              return (
                <div
                  key={proposal.contractId}
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="mb-3">
                    <span className="font-medium">{proposal.payload.asset.description}</span>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <Badge variant="outline" className="truncate max-w-[120px]">{senderDisplayName}</Badge>
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                      <Badge variant="secondary">You</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(proposal.contractId)}
                      disabled={processingId === proposal.contractId}
                    >
                      {processingId === proposal.contractId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(proposal.contractId)}
                      disabled={processingId === proposal.contractId}
                    >
                      {processingId === proposal.contractId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
