"use client"

import { 
  BarChart3,
  CheckCircle,
  Users,
  ArrowRight,
  Shield,
  Settings,
  FileText,
  Building2,
  BookOpen,
  Activity,
  History,
  ClipboardList,
  Clock,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

export default function ManagementLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header - Same as Case Management */}
      <header className="sticky top-0 z-50 w-full border-b bg-slate-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/barbados-coat-of-arms.png"
              alt="Barbados Coat of Arms"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-sm font-semibold text-white">SGC Digital - Management Portal</h1>
              <p className="text-xs text-white/70">Internal Administration System</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
              <Link href="/">Public Portal</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
              <Link href="/case-management">Case Management</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/management/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Matching Main Landing Page */}
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-500/10 to-transparent" />
          
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Authorized Staff Badge */}
              <Badge variant="outline" className="mb-6 border-white/30 text-white/80 bg-white/5">
                <Shield className="h-3 w-3 mr-1" />
                Authorized Staff Only
              </Badge>
              
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                <span className="text-emerald-400">SGC</span> <span className="text-blue-500">Digital</span>
              </h1>
              <p className="mt-3 text-xl text-white font-semibold">
                Management Portal
              </p>
              <p className="mt-2 text-lg text-emerald-400 italic">
                Administrative System for SGC Staff
              </p>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
                SGC-Digital Management Portal for tracking, managing and monitoring 
                Contracts and Correspondence Applications.
              </p>
              
              {/* Quick Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-56 bg-blue-600 hover:bg-blue-700 text-white shadow-lg" asChild>
                  <Link href="/management/login?redirect=/management/monitoring">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Monitoring
                  </Link>
                </Button>
                <Button size="lg" className="w-full sm:w-56 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                  <Link href="/management/login?redirect=/management/transactions">
                    <History className="mr-2 h-5 w-5" />
                    Transaction History
                  </Link>
                </Button>
                <Button size="lg" className="w-full sm:w-56 bg-slate-600 hover:bg-slate-700 text-white shadow-lg" asChild>
                  <Link href="/management/login?redirect=/management/status">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Status
                  </Link>
                </Button>
              </div>
              
              {/* Sign In / Register */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild className="min-w-[180px]">
                  <Link href="/management/login">
                    <Shield className="mr-2 h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-w-[180px] bg-transparent border-white/30 text-white hover:bg-white/10">
                  <Link href="/management/register">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
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
                Management Modules
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Access registers, system configuration, reports, and administrative functions 
                for the SGC Digital platform.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {/* Registers Card */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Registers</CardTitle>
                      <CardDescription>Master Data Management</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage correspondence types, contract categories, MDAs, officers, 
                    and other reference data.
                  </p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href="/management/login?redirect=/management/registers">
                      Open Registers
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Reports Card */}
              <Card className="border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Reports</CardTitle>
                      <CardDescription>Analytics & Insights</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate reports on case volumes, SLA performance, officer workload, 
                    and system metrics.
                  </p>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/management/login?redirect=/management/reports">
                      Open Reports
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* User Management Card */}
              <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">User Management</CardTitle>
                      <CardDescription>Access Control</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage user accounts, roles, permissions, and access rights 
                    across the platform.
                  </p>
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href="/management/login?redirect=/management/users">
                      Open Users
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* System Config Card */}
              <Card className="border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                      <Settings className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">System Config</CardTitle>
                      <CardDescription>Platform Settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure SLA parameters, workflow rules, notification settings, 
                    and system preferences.
                  </p>
                  <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                    <Link href="/management/login?redirect=/management/settings">
                      Open Settings
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Audit Log Card */}
              <Card className="border-2 border-rose-200 hover:border-rose-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-rose-500 to-rose-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <Activity className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Audit Log</CardTitle>
                      <CardDescription>Activity History</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    View system activity logs, user actions, and security events 
                    for compliance tracking.
                  </p>
                  <Button asChild className="w-full bg-rose-600 hover:bg-rose-700">
                    <Link href="/management/login?redirect=/management/audit">
                      Open Audit Log
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Dashboard Card */}
              <Card className="border-2 border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-slate-500 to-slate-600" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                      <ClipboardList className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Dashboard</CardTitle>
                      <CardDescription>Overview & Metrics</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    View key performance indicators, system health, and 
                    real-time operational metrics.
                  </p>
                  <Button asChild className="w-full bg-slate-600 hover:bg-slate-700">
                    <Link href="/management/login?redirect=/management/dashboard">
                      Open Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
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
                Administration Features
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for managing and monitoring the SGC Digital platform.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="bg-gradient-to-br from-sky-500 to-sky-600 border-sky-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Real-time Monitoring</h3>
                  <p className="text-sm text-sky-100">
                    Live dashboards showing case volumes, SLA status, and system performance metrics.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Master Data Control</h3>
                  <p className="text-sm text-emerald-100">
                    Centralized management of all reference data, taxonomies, and system configurations.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Role-Based Access</h3>
                  <p className="text-sm text-purple-100">
                    Granular permission controls for Registry, Legal Officers, Supervisors, and Administrators.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Security & Compliance</h3>
                  <p className="text-sm text-amber-100">
                    Complete audit trails, activity logs, and security event monitoring.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-rose-500 to-rose-600 border-rose-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Custom Reports</h3>
                  <p className="text-sm text-rose-100">
                    Generate detailed reports with filters, exports, and scheduled delivery options.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-teal-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Workflow Configuration</h3>
                  <p className="text-sm text-teal-100">
                    Configure SLA parameters, escalation rules, and automated notifications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
                Need Access?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                If you are an SGC staff member and need access to the Management Portal, 
                submit a registration request for approval.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/management/register">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/management/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Link */}
        <section className="py-6 bg-slate-100 dark:bg-slate-900 border-t">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Public User?</span>
              <Link 
                href="/" 
                className="font-medium text-primary hover:underline"
              >
                Go to Public Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
