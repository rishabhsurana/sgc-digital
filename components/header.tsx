"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, User, LogIn, FileText, FileSignature, 
  LayoutDashboard, BarChart3, Home, ChevronDown 
} from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar with Government Branding */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex h-8 items-center justify-between px-4 lg:px-8 text-xs">
          <span className="font-medium">Government of Barbados - Official Portal</span>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/help" className="hover:underline">Help</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-4 group">
            <Image
              src="/images/sgc-digital-logo.png"
              alt="SGC Digital"
              width={56}
              height={50}
              className="group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block border-l border-primary/20 pl-4">
              <p className="text-base font-bold text-primary">SGC Digital</p>
              <p className="text-xs text-muted-foreground font-medium">Solicitor General{"'"}s Chambers</p>
              <p className="text-[10px] text-muted-foreground/70">Registry Correspondence & Contract Management</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg transition-all hover:text-primary hover:bg-primary/5"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg transition-all hover:text-primary hover:bg-primary/5">
                <FileText className="h-4 w-4" />
                Services
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/correspondence" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">Correspondence</p>
                      <p className="text-xs text-muted-foreground">Submit registry correspondence</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contracts" className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium">Contracts</p>
                      <p className="text-xs text-muted-foreground">Government contract requests</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg transition-all hover:text-primary hover:bg-primary/5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            
            <Link 
              href="/reports" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/80 rounded-lg transition-all hover:text-primary hover:bg-primary/5"
            >
              <BarChart3 className="h-4 w-4" />
              Reports
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-primary/10 hover:text-primary" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" className="hidden sm:flex bg-accent hover:bg-accent/90 text-accent-foreground shadow-md" asChild>
              <Link href="/register">
                <User className="mr-2 h-4 w-4" />
                Register
              </Link>
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-gradient-to-b from-card to-primary/5">
                <div className="flex items-center gap-3 mb-8 mt-4">
                  <Image
                    src="/images/sgc-digital-logo.png"
                    alt="SGC Digital"
                    width={48}
                    height={44}
                  />
                  <div>
                    <p className="font-bold text-primary">SGC Digital</p>
                    <p className="text-xs text-muted-foreground">Solicitor General{"'"}s Chambers</p>
                    <p className="text-[10px] text-muted-foreground/70">Government of Barbados</p>
                  </div>
                </div>
                
                <nav className="flex flex-col gap-1">
                  <Link 
                    href="/" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Services
                  </div>
                  
                  <Link 
                    href="/correspondence" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors ml-2"
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    Correspondence
                  </Link>
                  <Link 
                    href="/contracts" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors ml-2"
                  >
                    <FileSignature className="h-5 w-5 text-purple-600" />
                    Contracts
                  </Link>
                  
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                    My Account
                  </div>
                  
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors ml-2"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link 
                    href="/reports" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors ml-2"
                  >
                    <BarChart3 className="h-5 w-5" />
                    Reports
                  </Link>
                  
                  <hr className="my-4 border-primary/20" />
                  
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
                  >
                    <User className="h-5 w-5" />
                    Register
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
