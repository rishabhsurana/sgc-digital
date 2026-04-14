"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FileSignature } from "lucide-react"
import { CorrespondenceRegisterTable } from "./correspondence-register-table"
import { ContractRegisterTable } from "./contract-register-table"

export function RegistersTab() {
  return (
    <Tabs defaultValue="correspondence" className="space-y-4">
      <TabsList className="h-auto bg-transparent p-0 gap-2">
        <TabsTrigger
          value="correspondence"
          className="flex items-center gap-2 h-11 px-5 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm transition-all
            data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-md
            hover:bg-blue-100 hover:border-blue-400"
        >
          <FileText className="h-4 w-4" />
          Correspondence
        </TabsTrigger>
        <TabsTrigger
          value="contracts"
          className="flex items-center gap-2 h-11 px-5 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-sm transition-all
            data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-600 data-[state=active]:shadow-md
            hover:bg-emerald-100 hover:border-emerald-400"
        >
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
