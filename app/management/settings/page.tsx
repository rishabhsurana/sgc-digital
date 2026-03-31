"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bell, Shield, Database, Globe, Save } from "lucide-react"
import { apiGet, apiPut } from "@/lib/api-client"

type SettingsMap = Record<string, string>
type EventPrefs = Record<string, boolean>

const EVENT_OPTIONS = [
  { code: "new_correspondence_received", label: "New correspondence received" },
  { code: "contract_requires_approval", label: "Contract requires approval" },
  { code: "document_status_changed", label: "Document status changed" },
  { code: "user_registration_pending", label: "User registration pending" },
  { code: "system_alerts", label: "System alerts" },
]

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)
  const [isSavingSystem, setIsSavingSystem] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [orgName, setOrgName] = useState("")
  const [orgAbbr, setOrgAbbr] = useState("")
  const [orgAddress, setOrgAddress] = useState("")
  const [orgPhone, setOrgPhone] = useState("")
  const [orgEmail, setOrgEmail] = useState("")
  const [timezone, setTimezone] = useState("ast")

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [eventPrefs, setEventPrefs] = useState<EventPrefs>({})

  const [twoFactorAuth, setTwoFactorAuth] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("30")

  const [correspondenceRefFormat, setCorrespondenceRefFormat] = useState("COR-{YEAR}-{SEQ:4}")
  const [contractRefFormat, setContractRefFormat] = useState("CON-{YEAR}-{SEQ:4}")
  const [dataRetentionYears, setDataRetentionYears] = useState("7")
  const [backupSchedule, setBackupSchedule] = useState("daily")

  const hasFeedback = useMemo(() => feedback !== null, [feedback])

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true)
        const [settingsRes, eventsRes] = await Promise.all([
          apiGet<SettingsMap>("/api/settings"),
          apiGet<EventPrefs>("/api/settings/notification-events"),
        ])

        if (!settingsRes.success || !settingsRes.data) {
          setFeedback(settingsRes.error || "Failed to load settings.")
          return
        }

        const s = settingsRes.data
        setOrgName(s.org_name || "Solicitor General's Chambers")
        setOrgAbbr(s.org_abbr || "SGC")
        setOrgAddress(s.org_address || "Marine House, Hastings, Christ Church, Barbados")
        setOrgPhone(s.org_phone || "+1 (246) 431-7700")
        setOrgEmail(s.org_email || s.system_email || "info@sgc.gov.bb")
        setTimezone(s.timezone || "ast")

        setEmailNotifications((s.email_notifications_enabled || "true") === "true")
        setSmsNotifications((s.sms_notifications_enabled || "false") === "true")
        setTwoFactorAuth((s.require_2fa || "true") === "true")
        setSessionTimeout(s.session_timeout || "30")

        setCorrespondenceRefFormat(s.ref_number_format_corr || "COR-{YEAR}-{SEQ:4}")
        setContractRefFormat(s.ref_number_format_contract || "CON-{YEAR}-{SEQ:4}")
        setDataRetentionYears(s.data_retention_years || "7")
        setBackupSchedule(s.backup_schedule || "daily")

        if (eventsRes.success && eventsRes.data) {
          setEventPrefs(eventsRes.data)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  async function saveSettings(settings: SettingsMap, setter: (v: boolean) => void, successMessage: string) {
    setter(true)
    setFeedback(null)
    try {
      const res = await apiPut<{ updated: number }>("/api/settings/bulk", { settings })
      if (!res.success) {
        setFeedback(res.error || "Failed to save settings.")
        return
      }
      setFeedback(successMessage)
    } finally {
      setter(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and configurations</p>
      </div>
      {hasFeedback && (
        <p className="text-sm text-muted-foreground border rounded-md px-3 py-2">{feedback}</p>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgAbbr">Abbreviation</Label>
                  <Input id="orgAbbr" value={orgAbbr} onChange={(e) => setOrgAbbr(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={orgAddress}
                  onChange={(e) => setOrgAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ast">Atlantic Standard Time (AST)</SelectItem>
                    <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                    <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                disabled={isLoading || isSavingGeneral}
                onClick={() =>
                  saveSettings(
                    {
                      org_name: orgName,
                      org_abbr: orgAbbr,
                      org_address: orgAddress,
                      org_phone: orgPhone,
                      org_email: orgEmail,
                      timezone,
                    },
                    setIsSavingGeneral,
                    "General settings saved."
                  )
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingGeneral ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Notification Events</h4>
                <div className="space-y-3">
                  {EVENT_OPTIONS.map((event) => (
                    <div key={event.code} className="flex items-center justify-between">
                      <Label className="font-normal">{event.label}</Label>
                      <Switch
                        checked={eventPrefs[event.code] ?? true}
                        onCheckedChange={(checked) =>
                          setEventPrefs((prev) => ({ ...prev, [event.code]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button
                disabled={isLoading || isSavingNotifications}
                onClick={async () => {
                  setIsSavingNotifications(true)
                  setFeedback(null)
                  try {
                    const [globalRes, eventsRes] = await Promise.all([
                      apiPut("/api/settings/bulk", {
                        settings: {
                          email_notifications_enabled: String(emailNotifications),
                          sms_notifications_enabled: String(smsNotifications),
                        },
                      }),
                      apiPut("/api/settings/notification-events", { events: eventPrefs }),
                    ])
                    if (!globalRes.success) {
                      setFeedback(globalRes.error || "Failed to save notification preferences.")
                      return
                    }
                    if (!eventsRes.success) {
                      setFeedback(eventsRes.error || "Failed to save notification events.")
                      return
                    }
                    setFeedback("Notification preferences saved.")
                  } finally {
                    setIsSavingNotifications(false)
                  }
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingNotifications ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password Policy</Label>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>- Minimum 8 characters</p>
                  <p>- At least one uppercase letter</p>
                  <p>- At least one number</p>
                  <p>- At least one special character</p>
                </div>
              </div>
              <Button
                disabled={isLoading || isSavingSecurity}
                onClick={() =>
                  saveSettings(
                    {
                      require_2fa: String(twoFactorAuth),
                      session_timeout: sessionTimeout,
                    },
                    setIsSavingSecurity,
                    "Security settings saved."
                  )
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingSecurity ? "Saving..." : "Save Security Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Advanced system configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Reference Number Format</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Correspondence</Label>
                    <Input
                      value={correspondenceRefFormat}
                      onChange={(e) => setCorrespondenceRefFormat(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Contracts</Label>
                    <Input
                      value={contractRefFormat}
                      onChange={(e) => setContractRefFormat(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Select value={dataRetentionYears} onValueChange={setDataRetentionYears}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="7">7 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="forever">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Backup Schedule</Label>
                <Select value={backupSchedule} onValueChange={setBackupSchedule}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                disabled={isLoading || isSavingSystem}
                onClick={() =>
                  saveSettings(
                    {
                      ref_number_format_corr: correspondenceRefFormat,
                      ref_number_format_contract: contractRefFormat,
                      data_retention_years: dataRetentionYears,
                      backup_schedule: backupSchedule,
                    },
                    setIsSavingSystem,
                    "System settings saved."
                  )
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingSystem ? "Saving..." : "Save System Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
