"use client"

import { useState } from "react"
import { useDaml, type Asset } from "@/context/daml-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TransferModal } from "@/components/transfer-modal"
import { Package, ArrowRightLeft, Inbox } from "lucide-react"

export function AssetList() {
  const { assets, isLoading } = useDaml()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const handleTransferClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsTransferModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsTransferModalOpen(false)
    setSelectedAsset(null)
  }

  if (isLoading && assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Assets
          </CardTitle>
          <CardDescription>Assets you currently own</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Assets
            {assets.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {assets.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Assets you currently own</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No assets yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first asset using the form below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.contractId}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{asset.description}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-mono truncate">
                      ID: {asset.contractId.slice(0, 20)}...
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTransferClick(asset)}
                    className="ml-4 shrink-0"
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Transfer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TransferModal asset={selectedAsset} isOpen={isTransferModalOpen} onClose={handleCloseModal} />
    </>
  )
}
