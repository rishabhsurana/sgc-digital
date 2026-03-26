"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowRight, 
  Shield, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Lock,
  BookOpen,
  ClipboardList,
  Building2,
  CheckCircle
} from "lucide-react"
import { Footer } from "@/components/footer"

export default function ManagementLandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Registers Management",
      description: "Manage Legal Opinions, Contracts, Legislation, and Court Cases registers with full audit trails.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: ClipboardList,
      title: "Case Management",
      description: "Track correspondence, assignments, and workflow status across all chambers activities.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Generate comprehensive reports on workload, SLA compliance, and performance metrics.",
      color: "text-violet-600",
      bgColor: "bg-violet-50"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Manage staff accounts, roles, permissions, and access levels across the system.",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      icon: Settings,
      title: "System Configuration",
      description: "Configure workflows, templates, taxonomies, and system-wide settings.",
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
    {
      icon: Shield,
      title: "Audit & Compliance",
      description: "Complete audit logs, compliance reporting, and data governance tools.",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    }
  ]

  const accessRequirements = [
    "Must be an authorized SGC staff member",
    "Registration requires approval from system administrator",
    "Role-based access controls apply to all features",
    "All activities are logged for audit purposes"
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/barbados-coat-of-arms.png"
              alt="Barbados Coat of Arms"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-primary leading-tight">
                SGC Management Portal
              </span>
              <span className="text-xs text-muted-foreground">Internal Staff System</span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/">Public Portal</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/management/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/management/register">
                Request Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Same style as main landing */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
                <Lock className="h-4 w-4" />
                <span>Authorized Staff Only</span>
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Management Portal
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                SGC-Digital Management Portal for tracking, managing and monitoring 
                Contracts and Correspondence Applications.
              </p>
              
              {/* Quick Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white min-w-[180px]">
                  <Link href="/management/login?redirect=/management/monitoring">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Monitoring
                  </Link>
                </Button>
                <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[180px]">
                  <Link href="/management/login?redirect=/management/transactions">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Transaction History
                  </Link>
                </Button>
                <Button size="lg" asChild className="bg-slate-800 hover:bg-slate-900 text-white min-w-[180px]">
                  <Link href="/management/login?redirect=/management/status">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Status
                  </Link>
                </Button>
              </div>
              
              {/* Sign In / Register Links */}
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
          
          {/* Decorative elements */}
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        </section>

        {/* Features Grid */}
        <section className="py-16 lg:py-24 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Portal Capabilities
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Comprehensive tools for managing all aspects of SGC operations
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:shadow-lg transition-shadow border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className={`inline-flex rounded-lg p-3 ${feature.bgColor} mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Access Requirements */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl mb-6">
                  Access Requirements
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  The Management Portal is restricted to authorized SGC staff members. 
                  All access requests are reviewed and approved by system administrators.
                </p>
                <ul className="space-y-4">
                  {accessRequirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-blue-600 text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Need Access?</h3>
                    <p className="text-sm text-muted-foreground">Request access to the Management Portal</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  If you are an SGC staff member and need access to the Management Portal, 
                  submit a registration request. Your request will be reviewed by the system administrator.
                </p>
                <Button asChild className="w-full">
                  <Link href="/management/register">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Sign In?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Access the Management Portal to manage registers, cases, and administrative functions.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/management/login">
                    Sign In to Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/">
                    Back to Public Site
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Link back to public portal */}
        <section className="py-6 bg-slate-100 border-t">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Looking for the public portal?</span>
              <Link 
                href="/" 
                className="font-medium text-primary hover:underline"
              >
                Visit Public Site
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
