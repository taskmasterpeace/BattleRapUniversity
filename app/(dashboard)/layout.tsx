import type React from "react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
