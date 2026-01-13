"use client"

import { useState } from "react"
import { useDaml, type Asset, AVAILABLE_PARTIES } from "@/context/daml-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Loader2, Send } from "lucide-react"

interface TransferModalProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
}

export function TransferModal({ asset, isOpen, onClose }: TransferModalProps) {
  const { party, proposeTransfer, isLoading } = useDaml()
  const { toast } = useToast()
  const [recipient, setRecipient] = useState("")
  const [step, setStep] = useState<"select" | "confirm">("select")

  const availableRecipients = AVAILABLE_PARTIES.filter((p) => p.id !== party?.id)

  const handleClose = () => {
    setRecipient("")
    setStep("select")
    onClose()
  }

  const handleNext = () => {
    if (!recipient) {
      toast({
        title: "Validation Error",
        description: "Please select a recipient",
        variant: "destructive",
      })
      return
    }
    setStep("confirm")
  }

  const handleBack = () => {
    setStep("select")
  }

  const handleTransfer = async () => {
    if (!asset || !recipient) return

    try {
      await proposeTransfer(asset.contractId, recipient)
      toast({
        title: "Transfer Proposed",
        description: `Transfer proposal sent to ${recipient}`,
      })
      handleClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to propose transfer",
        variant: "destructive",
      })
    }
  }

  if (!asset) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === "select" ? "Transfer Asset" : "Confirm Transfer"}</DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Select a party to transfer this asset to"
              : "Review the transfer details before confirming"}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Asset</p>
              <p className="font-medium">{asset.description}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select a party" />
                </SelectTrigger>
                <SelectContent>
                  {availableRecipients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {p.displayName[0]}
                        </div>
                        {p.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Asset</p>
              <p className="font-medium">{asset.description}</p>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {party?.displayName[0]}
                </div>
                <p className="mt-1 text-sm font-medium">{party?.displayName}</p>
                <p className="text-xs text-muted-foreground">Sender</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                  {recipient[0]}
                </div>
                <p className="mt-1 text-sm font-medium">{recipient}</p>
                <p className="text-xs text-muted-foreground">Recipient</p>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              The recipient will need to accept this transfer proposal.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "confirm" && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {step === "select" ? (
            <Button onClick={handleNext} disabled={!recipient}>
              Next
            </Button>
          ) : (
            <Button onClick={handleTransfer} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Proposal
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
