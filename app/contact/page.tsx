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
  Building2, HelpCircle, MessageSquare, FileQuestion
} from "lucide-react"

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
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-medium text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a question or need assistance? Get in touch with the Solicitor General&apos;s Chambers.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
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

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
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

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
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

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
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

            {/* Contact Form & Info */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Send us a Message
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and we will get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
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
                          className="w-full h-12 bg-primary hover:bg-primary/90" 
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
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Departments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Registry</h4>
                      <p className="text-sm text-muted-foreground">registry@sgc.gov.bb</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Contracts Division</h4>
                      <p className="text-sm text-muted-foreground">contracts@sgc.gov.bb</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Legal Advisory</h4>
                      <p className="text-sm text-muted-foreground">advisory@sgc.gov.bb</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Litigation</h4>
                      <p className="text-sm text-muted-foreground">litigation@sgc.gov.bb</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <a href="/help" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <FileQuestion className="h-4 w-4" />
                      Help &amp; FAQs
                    </a>
                    <a href="/register" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <FileQuestion className="h-4 w-4" />
                      Register an Account
                    </a>
                    <a href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <FileQuestion className="h-4 w-4" />
                      Track Submissions
                    </a>
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
