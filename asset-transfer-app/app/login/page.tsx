"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDaml, AVAILABLE_PARTIES, type Party } from "@/context/daml-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Boxes, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const { party, setParty } = useDaml()
  const router = useRouter()

  useEffect(() => {
    if (party) {
      router.push("/")
    }
  }, [party, router])

  const handleSelectParty = (selectedParty: Party) => {
    setParty(selectedParty)
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Boxes className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Transfer</h1>
          <p className="mt-2 text-muted-foreground">DAML-powered distributed ledger asset management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Party</CardTitle>
            <CardDescription>Choose a party to authenticate as for this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {AVAILABLE_PARTIES.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                className="w-full justify-between h-auto py-4 bg-transparent"
                onClick={() => handleSelectParty(p)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                    {p.displayName[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{p.displayName}</p>
                    <p className="text-xs text-muted-foreground">Party ID: {p.id}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Connected to ledger:{" "}
          <code className="rounded bg-muted px-1 py-0.5">{process.env.NEXT_PUBLIC_LEDGER_ID || "sandbox"}</code>
        </p>
      </div>
    </div>
  )
}
