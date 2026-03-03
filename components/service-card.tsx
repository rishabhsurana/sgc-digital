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
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 bg-card">
      <div className="absolute top-0 left-0 h-1 w-full bg-primary/10 group-hover:bg-primary transition-colors" />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <Badge variant={restricted ? "secondary" : "default"} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-4">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full group/btn">
          <Link href={href}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
