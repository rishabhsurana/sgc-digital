import { ManagementLayoutClient } from "./management-layout-client"

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ManagementLayoutClient>
      {children}
    </ManagementLayoutClient>
  )
}
