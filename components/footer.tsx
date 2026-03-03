import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-serif text-lg font-bold text-primary-foreground">SGC</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">SGC Digital</p>
                <p className="text-sm text-muted-foreground">Solicitor General{"'"}s Chambers</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              The official digital portal for the Solicitor General{"'"}s Chambers of Barbados, 
              enabling secure submission and tracking of Registry Correspondence and Government Contracts.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/correspondence" className="text-muted-foreground hover:text-foreground transition-colors">
                  Registry Correspondence
                </Link>
              </li>
              <li>
                <Link href="/contracts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Government Contracts
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Track Submissions
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  How to Use
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Government of Barbados. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Solicitor General{"'"}s Chambers Digital Services
          </p>
        </div>
      </div>
    </footer>
  )
}
