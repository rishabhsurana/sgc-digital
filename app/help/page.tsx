import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  HelpCircle, FileText, FileSignature, UserPlus, LogIn, Search, 
  LayoutDashboard, Clock, Bell, Shield, Mail, Phone, BookOpen
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Matching Management Portal Style */}
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent" />
          
          <div className="container relative mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
              <HelpCircle className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Help &amp; Support
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Find answers to common questions and learn how to use SGC Digital effectively.
            </p>
            
            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" asChild>
                <Link href="/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register
                </Link>
              </Button>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
              <Button size="lg" className="bg-slate-600 hover:bg-slate-700 text-white shadow-lg" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-medium text-foreground mb-8 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Quick Start Guide
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-t-4 border-t-blue-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">1. Register</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create an account by selecting your entity type (Ministry, Court, Attorney, Company, or Public). 
                    Provide your contact details and verify your email address.
                  </CardDescription>
                  <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href="/register">Register Now</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-emerald-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">2. Sign In</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Use your registered email and password to sign in. 
                    Staff members can access both the Public Portal and Management Portal with the same credentials.
                  </CardDescription>
                  <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-indigo-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">3. Submit</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Submit correspondence requests or contracts through the appropriate forms. 
                    Upload required documents and provide all necessary details.
                  </CardDescription>
                  <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Link href="/correspondence">Submit Request</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-medium text-foreground mb-8 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-emerald-600" />
              Frequently Asked Questions
            </h2>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* General Questions */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-700 text-white text-xs">G</span>
                  General
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-sgc">
                    <AccordionTrigger>What is SGC Digital?</AccordionTrigger>
                    <AccordionContent>
                      SGC Digital is the official online portal for the Solicitor General&apos;s Chambers of Barbados. 
                      It allows government entities, legal professionals, and the public to submit and track 
                      registry correspondence and government contracts electronically.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="who-can-use">
                    <AccordionTrigger>Who can use this portal?</AccordionTrigger>
                    <AccordionContent>
                      The portal is available to Ministries, Departments &amp; Agencies (MDAs), Courts, 
                      Statutory Bodies, Attorneys, Companies, and members of the public who need to 
                      interact with the Solicitor General&apos;s Chambers.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="response-time">
                    <AccordionTrigger>How long will it take to get a response?</AccordionTrigger>
                    <AccordionContent>
                      Response times depend on the type and priority of your submission. Standard requests 
                      are typically processed within 10-15 business days. Urgent requests may be expedited 
                      with appropriate justification.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Correspondence Questions */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white text-xs">C</span>
                  Correspondence
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-correspondence">
                    <AccordionTrigger>What types of correspondence can I submit?</AccordionTrigger>
                    <AccordionContent>
                      You can submit General Enquiries, Litigation Matters, Legal Opinions (Advisory), 
                      Cabinet Matters, Legislation Review, International Agreements, and Employment Matters.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="urgent-request">
                    <AccordionTrigger>How do I mark a request as urgent?</AccordionTrigger>
                    <AccordionContent>
                      Select &quot;Urgent&quot; in the urgency field when completing your submission form. 
                      You will be required to provide a justification for the urgent status. 
                      Note that urgent requests are reviewed and may be downgraded if the justification is insufficient.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="track-status">
                    <AccordionTrigger>How do I track my submission status?</AccordionTrigger>
                    <AccordionContent>
                      After signing in, visit your Dashboard to view all your submissions and their current status. 
                      You can also use the reference number provided at submission to search for specific items.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Contracts Questions */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white text-xs">K</span>
                  Contracts
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="contract-types">
                    <AccordionTrigger>What contract types are supported?</AccordionTrigger>
                    <AccordionContent>
                      The portal supports Goods &amp; Services contracts, Consultancy agreements, 
                      Works contracts, Lease agreements, MOUs, Land transactions, and more. 
                      Select the appropriate category and instrument when submitting.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="required-documents">
                    <AccordionTrigger>What documents do I need to upload?</AccordionTrigger>
                    <AccordionContent>
                      Required documents vary by contract type but typically include the draft contract, 
                      procurement approval, technical specifications, and financial documentation. 
                      The form will indicate which documents are required for your specific submission.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="contract-renewal">
                    <AccordionTrigger>How do I submit a contract renewal?</AccordionTrigger>
                    <AccordionContent>
                      Select &quot;Renewal&quot; as the contract type and provide the original contract reference number. 
                      The system will validate the renewal against the original contract and track the renewal sequence.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Account Questions */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white text-xs">A</span>
                  Account &amp; Access
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="forgot-password">
                    <AccordionTrigger>I forgot my password. What do I do?</AccordionTrigger>
                    <AccordionContent>
                      Click &quot;Forgot password?&quot; on the login page and enter your registered email address. 
                      You will receive instructions to reset your password.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="multiple-users">
                    <AccordionTrigger>Can multiple users access my organization&apos;s account?</AccordionTrigger>
                    <AccordionContent>
                      Yes. Organizations (MDAs, Companies, Law Firms) can add multiple authorized users. 
                      The primary contact can manage user access from the account settings.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="staff-access">
                    <AccordionTrigger>I&apos;m a staff member. Do I need separate accounts?</AccordionTrigger>
                    <AccordionContent>
                      No. Staff members have unified access to both the Public Portal and Management Portal 
                      using the same credentials. Simply sign in and you will see the Management Portal option.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="relative overflow-hidden bg-slate-900 py-12 lg:py-16">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="container relative mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl font-medium text-white mb-4">
              Still need help?
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Our support team is available to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                <a href="tel:+12464304700">
                  <Phone className="mr-2 h-4 w-4" />
                  Call +1 (246) 430-4700
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
