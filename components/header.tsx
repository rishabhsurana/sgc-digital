"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogIn } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="font-serif text-lg font-bold text-primary-foreground">SGC</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">SGC Digital</p>
            <p className="text-xs text-muted-foreground">Government of Barbados</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link 
            href="/" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link 
            href="/correspondence" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Correspondence
          </Link>
          <Link 
            href="/contracts" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Contracts
          </Link>
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button size="sm" className="hidden sm:flex" asChild>
            <Link href="/register">
              <User className="mr-2 h-4 w-4" />
              Register
            </Link>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col gap-4 pt-8">
                <Link 
                  href="/" 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  Home
                </Link>
                <Link 
                  href="/correspondence" 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  Correspondence
                </Link>
                <Link 
                  href="/contracts" 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  Contracts
                </Link>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <hr className="my-2" />
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  Register
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
