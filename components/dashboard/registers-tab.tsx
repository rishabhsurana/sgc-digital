"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FileSignature } from "lucide-react"
import { CorrespondenceRegisterTable } from "./correspondence-register-table"
import { ContractRegisterTable } from "./contract-register-table"

export function RegistersTab() {
  return (
    <Tabs defaultValue="correspondence" className="space-y-4">
      <TabsList>
        <TabsTrigger value="correspondence" className="gap-1.5">
          <FileText className="h-4 w-4" />
          Correspondence
        </TabsTrigger>
        <TabsTrigger value="contracts" className="gap-1.5">
          <FileSignature className="h-4 w-4" />
          Contracts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="correspondence">
        <CorrespondenceRegisterTable />
      </TabsContent>

      <TabsContent value="contracts">
        <ContractRegisterTable />
      </TabsContent>
    </Tabs>
  )
}
