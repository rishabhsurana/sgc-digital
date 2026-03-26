"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail, Phone, MapPin, Clock, Send, CheckCircle, 
  Building2, HelpCircle, MessageSquare, FileQuestion, Globe
} from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Matching Management Portal Style */}
        <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent" />
          
          <div className="container relative mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <Mail className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-white mb-4">
              Contact Us
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Have a question or need assistance? Get in touch with the Solicitor General&apos;s Chambers.
            </p>
            
            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" asChild>
                <a href="tel:+12464304700">
                  <Phone className="mr-2 h-5 w-5" />
                  +1 (246) 430-4700
                </a>
              </Button>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" asChild>
                <a href="mailto:sgc@barbados.gov.bb">
                  <Mail className="mr-2 h-5 w-5" />
                  sgc@barbados.gov.bb
                </a>
              </Button>
              <Button size="lg" className="bg-slate-600 hover:bg-slate-700 text-white shadow-lg" asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  View FAQs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-t-4 border-t-blue-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Address</h3>
                      <p className="text-sm text-muted-foreground">
                        Marine House, Hastings<br />
                        Christ Church, Barbados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-emerald-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">
                        +1 (246) 430-4700<br />
                        +1 (246) 430-4701
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-indigo-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        sgc@barbados.gov.bb<br />
                        support@sgc.gov.bb
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-slate-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-600 text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Office Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday<br />
                        8:00 AM - 4:30 PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-emerald-400" />
                      Send us a Message
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Fill out the form below and we will get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isSubmitted ? (
                      <Alert className="border-emerald-200 bg-emerald-50">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <AlertDescription className="text-emerald-800">
                          Thank you for your message! We have received your enquiry and will respond within 2-3 business days.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input id="firstName" name="firstName" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input id="lastName" name="lastName" required />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input id="email" name="email" type="email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="organization">Organization</Label>
                          <Input id="organization" name="organization" placeholder="Ministry, Company, or Law Firm name" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="enquiryType">Enquiry Type *</Label>
                          <Select name="enquiryType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select enquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Enquiry</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="account">Account Issues</SelectItem>
                              <SelectItem value="correspondence">Correspondence Query</SelectItem>
                              <SelectItem value="contracts">Contracts Query</SelectItem>
                              <SelectItem value="feedback">Feedback / Suggestions</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input id="subject" name="subject" required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea 
                            id="message" 
                            name="message" 
                            rows={5} 
                            required
                            placeholder="Please provide details of your enquiry..."
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Send Message
                            </span>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Department Contacts */}
                <Card>
                  <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-400" />
                      Departments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white text-xs font-medium">R</div>
                      <div>
                        <h4 className="font-medium text-sm">Registry</h4>
                        <p className="text-sm text-muted-foreground">registry@sgc.gov.bb</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-600 text-white text-xs font-medium">C</div>
                      <div>
                        <h4 className="font-medium text-sm">Contracts Division</h4>
                        <p className="text-sm text-muted-foreground">contracts@sgc.gov.bb</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white text-xs font-medium">A</div>
                      <div>
                        <h4 className="font-medium text-sm">Legal Advisory</h4>
                        <p className="text-sm text-muted-foreground">advisory@sgc.gov.bb</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-600 text-white text-xs font-medium">L</div>
                      <div>
                        <h4 className="font-medium text-sm">Litigation</h4>
                        <p className="text-sm text-muted-foreground">litigation@sgc.gov.bb</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-emerald-400" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-6">
                    <Link href="/help" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Help &amp; FAQs</span>
                    </Link>
                    <Link href="/register" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <FileQuestion className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium">Register an Account</span>
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <FileQuestion className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium">Track Submissions</span>
                    </Link>
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
