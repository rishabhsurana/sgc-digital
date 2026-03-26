import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"
import { 
  CheckCircle,
  ArrowRight,
  BarChart3,
  History,
  Users
} from "lucide-react"

export default function ManagementLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AskRex position="content" />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 py-20 lg:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          
          <div className="container relative mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                <span className="text-emerald-400">SGC</span> <span className="text-blue-500">Digital</span>
              </h1>
              <p className="mt-3 text-xl text-white font-semibold">
                Management Portal
              </p>
              <p className="mt-2 text-lg text-emerald-400 italic">
                Transforming Government Services, Powering Tomorrow
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
            </div>
          </div>
        </section>

        {/* Public Portal Access - Subtle link */}
        <section className="py-6 bg-slate-100 dark:bg-slate-900 border-t">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Looking for the public portal?</span>
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
