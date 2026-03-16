"use client"

import { 
  Mail, 
  FileSignature, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  ArrowRight,
  Shield,
  Workflow,
  ListChecks,
  Search,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"

// Mock summary data
const summaryStats = {
  correspondence: {
    total: 1247,
    pending: 89,
    atRisk: 12,
    closedThisWeek: 34
  },
  contracts: {
    total: 423,
    pending: 45,
    atRisk: 5,
    approvedThisWeek: 12
  }
}

export default function CaseManagementLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-slate-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">SGC Digital - Case Management</h1>
              <p className="text-xs text-white/70">Internal BPM Portal</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
              <Link href="/management">Management Portal</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
              <Link href="/reports">Reports</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/">Public Portal</Link>
            </Button>
          </nav>
        </div>
      </header>

      <AskRex position="content" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-emerald-500/10 to-transparent" />
          
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                <span className="text-emerald-400">SGC</span> <span className="text-blue-500">Digital</span>
              </h1>
              <p className="mt-3 text-xl text-white font-semibold">
                Case Management Portal
              </p>
              <p className="mt-2 text-lg text-emerald-400 italic">
                BPM Workflow Management for SGC Staff
              </p>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
                Process, review, and approve Correspondence and Contract submissions 
                using enterprise-grade case management with full audit trail and SLA tracking.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-64 bg-blue-600 hover:bg-blue-700 text-white shadow-lg" asChild>
                  <Link href="/case-management/correspondence">
                    <Mail className="mr-2 h-5 w-5" />
                    Correspondence
                  </Link>
                </Button>
                <Button size="lg" className="w-full sm:w-64 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                  <Link href="/case-management/contracts">
                    <FileSignature className="mr-2 h-5 w-5" />
                    Contracts
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Module Cards Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Case Management Modules
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Select a module below to access the case management workqueues, dashboards, 
                and processing functions for each submission type.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
              {/* Correspondence/Registry Card */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Correspondence / Registry</CardTitle>
                      <CardDescription className="text-base">Case Management Module</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Process incoming correspondence from MDAs, Courts, Public, and other entities. 
                    Manage the full lifecycle from intake through assignment, processing, and closure.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-3xl font-bold text-blue-900">{summaryStats.correspondence.total}</p>
                      <p className="text-sm text-blue-600">Total Cases</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-3xl font-bold text-amber-900">{summaryStats.correspondence.pending}</p>
                      <p className="text-sm text-amber-600">Pending Review</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-3xl font-bold text-red-900">{summaryStats.correspondence.atRisk}</p>
                      <p className="text-sm text-red-600">At Risk (SLA)</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-3xl font-bold text-green-900">{summaryStats.correspondence.closedThisWeek}</p>
                      <p className="text-sm text-green-600">Closed This Week</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Key Features:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Daily Mail Dashboard for SG/DSG
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Officer Assignment & Workqueue Management
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        SLA Tracking with Escalation Alerts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Full Audit Trail & Case History
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Link href="/case-management/correspondence">
                        Open Module
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/case-management/correspondence/daily-mail">
                        Daily Mail
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contracts Card */}
              <Card className="border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <FileSignature className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Contracts</CardTitle>
                      <CardDescription className="text-base">Case Management Module</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Manage post-award contract vetting from MDA submission through legal review, 
                    drafting, approval, adjudication, and final execution.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-3xl font-bold text-emerald-900">{summaryStats.contracts.total}</p>
                      <p className="text-sm text-emerald-600">Total Cases</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-3xl font-bold text-amber-900">{summaryStats.contracts.pending}</p>
                      <p className="text-sm text-amber-600">Pending Review</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-3xl font-bold text-red-900">{summaryStats.contracts.atRisk}</p>
                      <p className="text-sm text-red-600">At Risk (SLA)</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-3xl font-bold text-green-900">{summaryStats.contracts.approvedThisWeek}</p>
                      <p className="text-sm text-green-600">Approved This Week</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Key Features:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Intake Validation & Officer Assignment
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Contract Drafting & Review Workflow
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Ministry Review & Signature Tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Adjudication & Dispatch Management
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <Link href="/case-management/contracts">
                        Open Module
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/case-management/contracts/workqueue">
                        Workqueue
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                BPM Platform Features
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Enterprise-grade case management with full workflow automation and compliance tracking.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="bg-gradient-to-br from-sky-500 to-sky-600 border-sky-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Workflow className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Workflow Automation</h3>
                  <p className="text-sm text-sky-100">
                    Automated stage transitions, task assignments, and notifications based on 
                    configurable business rules.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">SLA Management</h3>
                  <p className="text-sm text-emerald-100">
                    Real-time SLA tracking with visual indicators, automatic escalation alerts, 
                    and overdue notifications.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <ListChecks className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Task Management</h3>
                  <p className="text-sm text-purple-100">
                    Personal workqueues, task prioritization, and collaborative case handling 
                    with assignment tracking.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Audit Trail</h3>
                  <p className="text-sm text-amber-100">
                    Complete history of all actions, status changes, and user interactions 
                    for compliance and accountability.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-rose-500 to-rose-600 border-rose-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Analytics & Reports</h3>
                  <p className="text-sm text-rose-100">
                    AI-powered reporting with natural language queries, dashboards, and 
                    performance metrics.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-teal-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Role-Based Access</h3>
                  <p className="text-sm text-teal-100">
                    Granular permissions for Registry, Legal Officers, Supervisors, 
                    DSG, and Solicitor General roles.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Quick Access
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Jump directly to your most frequently used functions.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              <Button asChild variant="outline" size="lg">
                <Link href="/case-management/correspondence/daily-mail">
                  <Mail className="h-5 w-5 mr-2" />
                  Daily Mail Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/case-management/correspondence/workqueue">
                  <Clock className="h-5 w-5 mr-2" />
                  Correspondence Queue
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/case-management/contracts/workqueue">
                  <FileSignature className="h-5 w-5 mr-2" />
                  Contracts Queue
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/reports">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Reports & Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/management">
                  <Search className="h-5 w-5 mr-2" />
                  Management Portal
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-slate-900">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Need Assistance?
              </h2>
              <p className="mt-4 text-slate-300">
                Use our AI-powered assistant Rex for help with navigation, workflows, 
                or any questions about case management.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/help">
                    View Documentation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-slate-600 text-white hover:bg-slate-800" asChild>
                  <Link href="/management">
                    Back to Management Portal
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-900 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">
            SGC Digital - Case Management Portal | Solicitor General{"'"}s Chambers, Government of Barbados
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Internal use only. All actions are logged and audited.
          </p>
        </div>
      </footer>
    </div>
  )
}
