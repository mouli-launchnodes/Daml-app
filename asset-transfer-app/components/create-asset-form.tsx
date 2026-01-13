"use client"

import type React from "react"

import { useState } from "react"
import { useDaml } from "@/context/daml-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"

export function CreateAssetForm() {
  const { createAsset, isLoading } = useDaml()
  const { toast } = useToast()
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an asset description",
        variant: "destructive",
      })
      return
    }

    try {
      await createAsset(description.trim())
      setDescription("")
      toast({
        title: "Asset Created",
        description: `Successfully created asset: ${description}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create asset",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Asset
        </CardTitle>
        <CardDescription>Add a new asset to your portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Asset Description</Label>
            <Input
              id="description"
              placeholder="Enter asset description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              aria-describedby="description-hint"
            />
            <p id="description-hint" className="text-xs text-muted-foreground">
              Provide a clear description for your new asset
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !description.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Asset
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
