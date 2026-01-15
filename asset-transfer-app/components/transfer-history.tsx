"use client"

import { useMemo, useState } from "react"
import { useDaml, type TransferHistoryContract } from "@/context/daml-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { History, ArrowRight, Inbox, ArrowUpDown } from "lucide-react"

type SortField = "timestamp" | "assetName"
type SortOrder = "asc" | "desc"

export function TransferHistory() {
  const { transferHistory, isLoading, party } = useDaml()
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const sortedHistory = useMemo(() => {
    const sorted = [...transferHistory].sort((a, b) => {
      let comparison = 0

      if (sortField === "timestamp") {
        const timeA = new Date(a.payload.transferredAt).getTime()
        const timeB = new Date(b.payload.transferredAt).getTime()
        comparison = timeA - timeB
      } else if (sortField === "assetName") {
        comparison = a.payload.assetDescription.localeCompare(b.payload.assetDescription)
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return sorted
  }, [transferHistory, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPartyDisplayName = (partyId: string) => {
    // Extract display name from party ID (e.g., "Alice::1220..." -> "Alice")
    return partyId.split("::")[0]
  }

  if (isLoading && transferHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transfer History
          </CardTitle>
          <CardDescription>Track all asset transfers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-32" />
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
          <History className="h-5 w-5" />
          Transfer History
          {sortedHistory.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {sortedHistory.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Track all asset transfers</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No transfer history</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Transfer history will appear here once assets are transferred
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-2">
              <Button
                variant={sortField === "timestamp" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("timestamp")}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort by Time
                {sortField === "timestamp" && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </Button>
              <Button
                variant={sortField === "assetName" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("assetName")}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort by Name
                {sortField === "assetName" && (
                  <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {sortedHistory.map((history) => {
                const isReceiver = history.payload.toParty === party?.id
                const isSender = history.payload.fromParty === party?.id

                return (
                  <div
                    key={history.contractId}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="mb-2">
                      <span className="font-medium text-lg">{history.payload.assetDescription}</span>
                      {isReceiver && (
                        <Badge variant="default" className="ml-2">
                          Received
                        </Badge>
                      )}
                      {isSender && (
                        <Badge variant="secondary" className="ml-2">
                          Sent
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline">{getPartyDisplayName(history.payload.fromParty)}</Badge>
                      <ArrowRight className="h-4 w-4" />
                      <Badge variant="outline">{getPartyDisplayName(history.payload.toParty)}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Transferred: {formatTimestamp(history.payload.transferredAt)}</span>
                      <span className="font-mono">ID: {history.contractId.slice(0, 16)}...</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
