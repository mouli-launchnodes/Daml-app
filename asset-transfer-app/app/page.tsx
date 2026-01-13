"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDaml } from "@/context/daml-context"
import { LayoutHeader } from "@/components/layout-header"
import { AssetList } from "@/components/asset-list"
import { CreateAssetForm } from "@/components/create-asset-form"
import { ProposalList } from "@/components/proposal-list"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const { party } = useDaml()
  const router = useRouter()

  useEffect(() => {
    if (!party) {
      router.push("/login")
    }
  }, [party, router])

  if (!party) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <LayoutHeader />

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your assets and transfer proposals</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AssetList />
            <CreateAssetForm />
          </div>
          <div>
            <ProposalList />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
