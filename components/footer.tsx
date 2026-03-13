import Link from "next/link"
import Image from "next/image"
import { FileText, FileSignature, LayoutDashboard, BarChart3, HelpCircle, Mail, Shield, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-primary/20">
      {/* Main Footer */}
      <div className="bg-gradient-to-b from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="h-1 w-4 bg-accent rounded" />
                About SGC Digital
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The official digital portal for the Solicitor General{"'"}s Chambers of Barbados, 
                enabling secure submission and tracking of Registry Correspondence and Government Contracts.
              </p>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="h-1 w-4 bg-accent rounded" />
                Services
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/correspondence" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <FileText className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    Registry Correspondence
                  </Link>
                </li>
                <li>
                  <Link href="/contracts" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <FileSignature className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                    Government Contracts
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <LayoutDashboard className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                    Track Submissions
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <BarChart3 className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
                    Reports & Analytics
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="h-1 w-4 bg-accent rounded" />
                Support
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    How to Use
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="h-1 w-4 bg-accent rounded" />
                Contact
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Marine House, Hastings<br />Christ Church, Barbados</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+1 (246) 430-4700</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>sgc@barbados.gov.bb</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar - matching header dimensions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex h-10 items-center justify-between px-4 lg:px-6 text-xs">
          {/* Left: Government Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/barbados-coat-of-arms.png"
              alt="Barbados Coat of Arms"
              width={28}
              height={28}
            />
            <div className="hidden sm:flex items-center">
              <span className="font-medium">Government of Barbados</span>
              <span className="mx-2 opacity-50">|</span>
              <span className="text-white/70">© {new Date().getFullYear()}</span>
            </div>
          </div>
          
          {/* Center: Links */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Terms of Use</Link>
            <Link href="/accessibility" className="hover:underline">Accessibility</Link>
            <Link href="/sitemap" className="hover:underline">Sitemap</Link>
          </div>
          
          {/* Right: SGC Digital Logo */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="font-medium">SGC Digital</span>
              <span className="mx-2 opacity-50">|</span>
              <span className="text-white/70">Solicitor General{"'"}s Chambers</span>
            </div>
            <Image
              src="/images/sgc-digital-logo.png"
              alt="SGC Digital"
              width={28}
              height={28}
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
