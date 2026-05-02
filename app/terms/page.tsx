import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent" />

          <div className="container relative mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
              <Scale className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Terms and conditions governing your use of the SGC Digital platform.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing or using the SGC Digital platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not use the platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. Use of the Platform</h3>
                <p className="text-muted-foreground">
                  The SGC Digital platform is provided for the purpose of submitting and managing correspondence and contract requests with the Solicitor General&apos;s Chambers. You agree to use the platform only for its intended purposes and in compliance with all applicable laws and regulations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">3. Account Responsibilities</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">4. Submissions and Content</h3>
                <p className="text-muted-foreground">
                  You are solely responsible for the accuracy and completeness of any information, documents, or materials submitted through the platform. Submitting false or misleading information may result in the rejection of your request and potential legal consequences.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">5. Intellectual Property</h3>
                <p className="text-muted-foreground">
                  All content, design, and functionality of the SGC Digital platform are the property of the Solicitor General&apos;s Chambers and are protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written consent.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">6. Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  The SGC Digital platform is provided on an &quot;as is&quot; basis. We make no warranties, express or implied, regarding the availability, reliability, or accuracy of the platform. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">7. Termination</h3>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate your access to the platform at any time, with or without notice, for conduct that we determine violates these Terms of Service or is harmful to other users, us, or third parties.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">8. Modifications</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to this page. Your continued use of the platform after any modifications constitutes acceptance of the updated terms.
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Last updated: April 2026. If you have questions about these Terms of Service, please visit our Contact page.
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
