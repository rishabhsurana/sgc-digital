"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  FileText,
  FileSignature,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react"

const REGISTER_STATS = {
  correspondence: {
    total: 1247,
    pending: 47,
    inProgress: 89,
    completed: 1111,
    thisWeek: 34,
    trend: "+12%"
  },
  contracts: {
    total: 456,
    pending: 23,
    inProgress: 45,
    completed: 388,
    thisWeek: 12,
    trend: "+8%"
  }
}

export default function RegistersPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Registers</h1>
        <p className="mt-1 text-muted-foreground">
          Access and manage correspondence and contract registers.
        </p>
      </div>

      {/* Register Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Correspondence Register Card */}
        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">Correspondence Register</CardTitle>
                  <CardDescription>All registry correspondence submissions</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                {REGISTER_STATS.correspondence.trend} this month
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{REGISTER_STATS.correspondence.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{REGISTER_STATS.correspondence.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{REGISTER_STATS.correspondence.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{REGISTER_STATS.correspondence.completed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Pending Review</span>
                </div>
                <span className="font-bold text-amber-700">{REGISTER_STATS.correspondence.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">In Progress</span>
                </div>
                <span className="font-bold text-blue-700">{REGISTER_STATS.correspondence.inProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Completed This Week</span>
                </div>
                <span className="font-bold text-green-700">{REGISTER_STATS.correspondence.thisWeek}</span>
              </div>
            </div>

            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/management/correspondence-register">
                Open Correspondence Register
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Contracts Register Card */}
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white">
                  <FileSignature className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-purple-900">Contracts Register</CardTitle>
                  <CardDescription>All government contract submissions</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                {REGISTER_STATS.contracts.trend} this month
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{REGISTER_STATS.contracts.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{REGISTER_STATS.contracts.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{REGISTER_STATS.contracts.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{REGISTER_STATS.contracts.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Pending Review</span>
                </div>
                <span className="font-bold text-amber-700">{REGISTER_STATS.contracts.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">In Progress</span>
                </div>
                <span className="font-bold text-purple-700">{REGISTER_STATS.contracts.inProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Completed This Week</span>
                </div>
                <span className="font-bold text-green-700">{REGISTER_STATS.contracts.thisWeek}</span>
              </div>
            </div>

            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/management/contracts-register">
                Open Contracts Register
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
