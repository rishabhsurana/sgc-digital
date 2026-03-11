import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, type LucideIcon } from "lucide-react"

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  features: string[]
  badge?: string
  restricted?: boolean
}

export function ServiceCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  features, 
  badge,
  restricted 
}: ServiceCardProps) {
  // Correspondence = emerald/green theme, Contracts = blue theme
  const colorTheme = restricted 
    ? { bg: "bg-slate-800", border: "border-slate-700", icon: "bg-blue-500/20", iconText: "text-blue-400", accent: "text-blue-400", button: "bg-blue-600 hover:bg-blue-700" }
    : { bg: "bg-slate-800", border: "border-slate-700", icon: "bg-emerald-500/20", iconText: "text-emerald-400", accent: "text-emerald-400", button: "bg-emerald-600 hover:bg-emerald-700" }
  
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${colorTheme.bg} ${colorTheme.border} shadow-lg`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorTheme.icon}`}>
            <Icon className={`h-6 w-6 ${colorTheme.iconText}`} />
          </div>
          {badge && (
            <Badge variant="secondary" className={`text-xs bg-slate-700 ${colorTheme.accent} border-slate-600 hover:bg-slate-600`}>
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-4 text-white">{title}</CardTitle>
        <CardDescription className="text-slate-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
              <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${colorTheme.accent.replace('text-', 'bg-')} shrink-0`} />
              {feature}
            </li>
          ))}
        </ul>
        <Button asChild className={`w-full group/btn ${colorTheme.button} text-white`}>
          <Link href={href}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
