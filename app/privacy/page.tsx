import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent" />

          <div className="container relative mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              How we collect, use, and protect your personal information.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
                <p className="text-muted-foreground">
                  We collect information you provide directly when using the SGC Digital platform, including your name, email address, contact details, and any documents or data submitted through correspondence and contract forms.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. How We Use Your Information</h3>
                <p className="text-muted-foreground">
                  Your information is used to process your submissions, manage your account, communicate with you regarding your requests, and improve our services. We may also use aggregated, anonymized data for analytics and reporting purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">3. Data Storage and Security</h3>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All data is stored on secure servers with restricted access.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">4. Data Sharing</h3>
                <p className="text-muted-foreground">
                  We do not sell or rent your personal information to third parties. Information may be shared with authorized government departments and agencies (MDAs) as required to process your submissions and fulfill our obligations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">5. Your Rights</h3>
                <p className="text-muted-foreground">
                  You have the right to access, correct, or request deletion of your personal data. You may also request a copy of the data we hold about you. To exercise these rights, please contact us through the Contact page.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">6. Cookies and Tracking</h3>
                <p className="text-muted-foreground">
                  Our platform uses essential cookies to maintain your session and ensure the proper functioning of the service. We do not use third-party tracking cookies for advertising purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">7. Changes to This Policy</h3>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Last updated: April 2026. If you have questions about this Privacy Policy, please visit our Contact page.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
