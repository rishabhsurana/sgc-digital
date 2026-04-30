import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accessibility, CheckCircle2, MonitorSmartphone, Keyboard, Ear, Eye, Mail } from "lucide-react"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <div className="container relative mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <Accessibility className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">Accessibility Statement</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              SGC Digital is committed to ensuring our portal is accessible to all users.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-t-4 border-t-emerald-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Keyboard className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-medium mb-1">Keyboard Navigation</h2>
                      <p className="text-sm text-muted-foreground">
                        Core actions are designed to be usable with keyboard-only navigation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-blue-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-medium mb-1">Readable Interface</h2>
                      <p className="text-sm text-muted-foreground">
                        We aim for clear structure, color contrast, and readable typography.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-indigo-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <MonitorSmartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-medium mb-1">Responsive Experience</h2>
                      <p className="text-sm text-muted-foreground">
                        Pages are built to function across desktop and mobile screen sizes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white rounded-none min-h-20 flex items-center">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      Our Accessibility Commitment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      We continuously improve SGC Digital to better support people with diverse accessibility needs.
                      Our objective is to make key services usable for all users, including users who rely on
                      assistive technologies.
                    </p>
                    <p>
                      We review portal experiences and make iterative improvements to structure, labels, interaction
                      behavior, and content clarity. Accessibility is treated as an ongoing responsibility, not a
                      one-time effort.
                    </p>
                    <p>
                      If you encounter any accessibility barriers, we encourage you to contact us so we can investigate
                      and address the issue promptly.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white rounded-none min-h-20 flex items-center">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Ear className="h-5 w-5 text-emerald-400" />
                      Need Assistance?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      If any part of this portal is difficult to use, contact us and include the page and issue details.
                    </p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href="/contact">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Support
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white rounded-none min-h-20 flex items-center">
                    <CardTitle className="text-lg">Related Pages</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3 text-sm">
                    <Link href="/help" className="block text-primary hover:underline">Help & Support</Link>
                    <Link href="/contact" className="block text-primary hover:underline">Contact</Link>
                    <Link href="/sitemap" className="block text-primary hover:underline">Sitemap</Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
