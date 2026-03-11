import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { 
  FileText, 
  FileSignature, 
  Search, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Building2,
  Users,
  Scale,
  LayoutDashboard
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 py-16 lg:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/10 to-transparent" />
          
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance">
                SGC Digital
              </h1>
              <p className="mt-3 text-xl text-accent font-semibold">
                Correspondence & Contract Management Portal
              </p>
              <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto text-pretty">
                Submit and track Correspondence and Government Contract requests 
                through our secure digital portal. Streamlined and automated digital services.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-56 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg" asChild>
                  <Link href="/correspondence">
                    <FileText className="mr-2 h-5 w-5" />
                    Correspondence
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-56 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/contracts">
                    <FileSignature className="mr-2 h-5 w-5" />
                    Contract Request
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild className="w-full sm:w-56">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    My Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Our Services
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Select a service below to begin your submission. All submissions are tracked 
                and you will receive updates at each stage of processing.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-4xl mx-auto">
              <ServiceCard
                title="Registry Correspondence"
                description="Submit correspondence to the Solicitor General's Chambers Registry for processing and response."
                icon={FileText}
                href="/correspondence"
                features={[
                  "General correspondence and enquiries",
                  "Litigation-related matters",
                  "Cabinet papers and advisory requests",
                  "Document upload with type classification"
                ]}
                badge="Open to All"
              />
              
              <ServiceCard
                title="Government Contracts"
                description="Submit post-award contract requests for legal review and processing by the SGC."
                icon={FileSignature}
                href="/contracts"
                features={[
                  "Procurement of Goods & Services",
                  "Consultancy & Professional Services",
                  "Construction & Public Works",
                  "Dynamic document checklist by contract type"
                ]}
                badge="Ministries Only"
                restricted
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Portal Features
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Our digital portal provides a secure and efficient way to interact with 
                the Solicitor General{"'"}s Chambers.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gradient-to-br from-sky-500 to-sky-600 border-sky-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Secure Submissions</h3>
                  <p className="text-sm text-sky-100">
                    All submissions are encrypted and securely stored. Your documents are protected 
                    with enterprise-grade security.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Real-time Tracking</h3>
                  <p className="text-sm text-emerald-100">
                    Monitor the status of your submissions in real-time through your personal 
                    dashboard with detailed stage history.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Save & Resume</h3>
                  <p className="text-sm text-amber-100">
                    Save your progress as a draft and return later to complete your submission 
                    when convenient.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Guided Process</h3>
                  <p className="text-sm text-purple-100">
                    Step-by-step wizards guide you through each submission with validation 
                    to ensure completeness.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-rose-500 to-rose-600 border-rose-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Document Management</h3>
                  <p className="text-sm text-rose-100">
                    Upload and classify supporting documents with automatic validation 
                    of required files based on submission type.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-teal-600 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-4">
                    <ArrowRight className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Clarification Loop</h3>
                  <p className="text-sm text-teal-100">
                    Respond to requests for additional information directly through 
                    the portal without starting over.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* User Types Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Who Can Use This Portal
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Different user types have access to different services based on their 
                relationship with the Government of Barbados.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="bg-gradient-to-br from-sky-500 to-sky-600 border-sky-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Ministry / MDA</h3>
                      <p className="text-xs text-sky-100">Correspondence & Contracts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Scale className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Court</h3>
                      <p className="text-xs text-indigo-100">Correspondence Only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Statutory Body</h3>
                      <p className="text-xs text-emerald-100">Correspondence Only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Member of Public</h3>
                      <p className="text-xs text-amber-100">Correspondence Only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Scale className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Attorney-at-Law</h3>
                      <p className="text-xs text-purple-100">Correspondence Only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-500 to-slate-600 border-slate-600 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Other</h3>
                      <p className="text-xs text-slate-100">Correspondence Only</p>
                    </div>
                  </div>
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
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Register for an account to begin submitting and tracking your requests 
                with the Solicitor General{"'"}s Chambers.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/help">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
