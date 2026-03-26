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
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-foreground mb-4">
              Help &amp; Support
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions and learn how to use SGC Digital effectively.
            </p>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-medium text-foreground mb-8 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Quick Start Guide
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <UserPlus className="h-5 w-5 text-blue-600" />
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
                  <Button asChild variant="link" className="px-0 mt-2">
                    <Link href="/register">Register Now</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <LogIn className="h-5 w-5 text-green-600" />
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
                  <Button asChild variant="link" className="px-0 mt-2">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <FileText className="h-5 w-5 text-purple-600" />
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
                  <Button asChild variant="link" className="px-0 mt-2">
                    <Link href="/correspondence">Submit Request</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-medium text-foreground mb-8 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              Frequently Asked Questions
            </h2>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* General Questions */}
              <div>
                <h3 className="text-lg font-medium mb-4">General</h3>
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
                <h3 className="text-lg font-medium mb-4">Correspondence</h3>
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
                <h3 className="text-lg font-medium mb-4">Contracts</h3>
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
                <h3 className="text-lg font-medium mb-4">Account &amp; Access</h3>
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
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl font-medium text-foreground mb-4">
              Still need help?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Our support team is available to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
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
