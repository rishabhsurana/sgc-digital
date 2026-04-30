import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Home, Shield, FileText, Building2, type LucideIcon } from "lucide-react"

const sitemapGroups: Array<{
  title: string
  icon: LucideIcon
  links: Array<{ href: string; label: string }>
}> = [
  {
    title: "Public Pages",
    icon: Home,
    links: [
      { href: "/", label: "Home" },
      { href: "/help", label: "Help & Support" },
      { href: "/contact", label: "Contact" },
      { href: "/sitemap", label: "Sitemap" },
    ],
  },
  {
    title: "Authentication & Access",
    icon: Shield,
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Register" },
      { href: "/forgot-password", label: "Forgot Password" },
      { href: "/reset-password", label: "Reset Password" },
    ],
  },
  {
    title: "Submission & Tracking",
    icon: FileText,
    links: [
      { href: "/correspondence", label: "Registry Correspondence" },
      { href: "/contracts", label: "Government Contracts" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    title: "Management Portal",
    icon: Building2,
    links: [
      { href: "/management/login", label: "Management Login" },
      { href: "/management/register", label: "Management Registration" },
      { href: "/management/landing", label: "Management Landing" },
    ],
  },
]

export default function SitemapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent" />
          <div className="container relative mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
              <Globe className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">Sitemap</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Browse all key sections of the SGC Digital portal.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {sitemapGroups.map((group) => {
                const Icon = group.icon
                return (
                  <Card key={group.title} className="h-full overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white rounded-none min-h-20 flex items-center">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-indigo-300" />
                        {group.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-3">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link href={link.href} className="text-sm text-primary hover:underline">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
