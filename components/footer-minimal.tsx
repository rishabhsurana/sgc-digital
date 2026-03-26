import Link from "next/link"

export function FooterMinimal() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Solicitor General&apos;s Chambers</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Government of Barbados</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-foreground transition-colors">
              Help
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
