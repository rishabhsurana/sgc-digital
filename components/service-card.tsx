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
  const gradientClass = restricted 
    ? "from-indigo-500 to-indigo-600 border-indigo-600" 
    : "from-sky-500 to-sky-600 border-sky-600"
  
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-4 text-white">{title}</CardTitle>
        <CardDescription className="text-white/80">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-white/90">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full group/btn bg-white/20 hover:bg-white/30 text-white border border-white/30">
          <Link href={href}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
