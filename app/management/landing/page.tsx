"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Building2,
  Settings,
  ArrowRight,
  LogIn,
  UserPlus,
  Home,
  CheckCircle,
  Lock,
} from "lucide-react"

const FEATURES = [
  {
    icon: FileText,
    title: "Correspondence & Contracts Registers",
    description: "Access and manage all correspondence and contracts registers with comprehensive tracking capabilities.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Generate detailed reports and view analytics dashboards to monitor performance and trends.",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Manage user accounts, roles, and permissions across the organization.",
  },
  {
    icon: Building2,
    title: "MDA Management",
    description: "Administer ministries, departments, and agencies within the system.",
  },
  {
    icon: Settings,
    title: "System Configuration",
    description: "Configure system preferences, workflows, and organizational settings.",
  },
  {
    icon: Shield,
    title: "Audit & Compliance",
    description: "Track all system activities with comprehensive audit trails for compliance.",
  },
]

export default function ManagementLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/barbados-coat-of-arms.png"
                alt="Government of Barbados"
                width={40}
                height={40}
              />
              <div>
                <p className="font-bold text-primary">SGC Digital</p>
                <p className="text-[10px] text-muted-foreground">Management Portal</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Main Site
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/management/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Lock className="h-4 w-4" />
              Authorized Personnel Only
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              SGC Digital<br />
              <span className="text-primary">Management Portal</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              The centralized administration hub for the Solicitor General&apos;s Chambers. 
              Manage registers, users, reports, and system configurations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/management/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In to Portal
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/management/register">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Request Access
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Portal Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for managing the SGC Digital platform and its operations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Access Requirements */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Access Requirements
                </CardTitle>
                <CardDescription>
                  This portal is restricted to authorized SGC staff members only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Must be an SGC staff member</p>
                      <p className="text-sm text-muted-foreground">Access is limited to employees of the Solicitor General&apos;s Chambers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Registration requires approval</p>
                      <p className="text-sm text-muted-foreground">New access requests must be reviewed and approved by a system administrator.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Valid government email required</p>
                      <p className="text-sm text-muted-foreground">You must use your official government email address for registration.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    If you need access to this portal, please click &quot;Request Access&quot; above and complete the registration form. 
                    Your request will be reviewed within 1-2 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-primary-foreground">Ready to access the Management Portal?</h3>
              <p className="text-primary-foreground/80 text-sm mt-1">Sign in with your credentials or request access if you&apos;re a new user.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/management/login">
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Solicitor General&apos;s Chambers, Government of Barbados</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-primary">Main Site</Link>
              <Link href="/help" className="hover:text-primary">Help</Link>
              <Link href="/contact" className="hover:text-primary">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
