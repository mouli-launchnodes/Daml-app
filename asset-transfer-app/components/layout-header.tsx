"use client"

import { useDaml, AVAILABLE_PARTIES } from "@/context/daml-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { LogOut, ChevronDown, Boxes, Wifi, WifiOff } from "lucide-react"

export function LayoutHeader() {
  const { party, setParty, isConnected } = useDaml()
  const router = useRouter()

  const handleLogout = () => {
    setParty(null)
    router.push("/login")
  }

  const handleSwitchParty = (newParty: (typeof AVAILABLE_PARTIES)[0]) => {
    setParty(newParty)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Boxes className="h-6 w-6" />
            <span className="text-xl font-semibold">Asset Transfer</span>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        {party && (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {party.displayName[0]}
                  </div>
                  <span>{party.displayName}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {AVAILABLE_PARTIES.filter((p) => p.id !== party.id).map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => handleSwitchParty(p)}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {p.displayName[0]}
                    </div>
                    <span className="ml-2">Switch to {p.displayName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
