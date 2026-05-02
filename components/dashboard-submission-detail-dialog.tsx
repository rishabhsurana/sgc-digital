"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  fetchCorrespondenceDetail,
  fetchContractDetail,
  submitCorrespondenceResponse,
  submitContractResponse,
  uploadSubmissionDocuments,
  downloadDocumentAuthorized,
  formatBytes,
  formatYmd,
} from "@/lib/dashboard-api"
import type { ClarificationDocument, ClarificationMessage, SGCDocument, Submission } from "@/lib/dashboard-types"
import type { ClarificationRequestRow, SubmissionResponseRow } from "@/lib/dashboard-api"
import type { LucideIcon } from "lucide-react"
import {
  Download,
  Edit,
  Eye,
  FileIcon,
  FileText,
  MessageCircle,
  Paperclip,
  RefreshCw,
  Send,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"

export function DashboardSubmissionDetailDialog({
  submission,
  status,
  defaultTab = "details",
  onAfterRespond,
}: {
  submission: Submission
  status: { label: string; color: string; icon: LucideIcon }
  defaultTab?: "details" | "documents" | "respond"
  onAfterRespond?: () => void
}) {
  const router = useRouter()
  const [display, setDisplay] = useState<Submission>(submission)
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailReloadKey, setDetailReloadKey] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [responseMessage, setResponseMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function buildClarificationTrail(
    requests: ClarificationRequestRow[],
    submissionResponses: SubmissionResponseRow[] = []
  ): ClarificationMessage[] {
    const messages: ClarificationMessage[] = []
    for (const req of requests || []) {
      const docs: ClarificationDocument[] = (req.documents || []).map((d) => ({
        id: d.id,
        fileName: d.file_name,
        fileSize: d.file_size,
        mimeType: d.mime_type,
      }))
      messages.push({
        id: req.clarification_request_id,
        sender: "sgc",
        message: req.request_message,
        timestamp: req.requested_at,
        title: req.request_title,
        documents: docs.length > 0 ? docs : undefined,
        is_validated: req.is_validated,
      })
      for (const resp of req.responses || []) {
        messages.push({
          id: resp.applicant_response_id,
          sender: "applicant",
          message: resp.response_message,
          timestamp: resp.responded_at,
        })
      }
    }
    for (const resp of submissionResponses || []) {
      messages.push({
        id: resp.response_id,
        sender: "applicant",
        message: resp.response_text || "Responded to clarification request.",
        timestamp: resp.created_at,
      })
    }
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    return messages
  }

  useEffect(() => {
    let cancelled = false
    setDisplay(submission)
    setDetailLoading(true)
    setDetailError(null)

    async function load() {
      try {
        if (submission.type === "correspondence") {
          const res = await fetchCorrespondenceDetail(submission.id)
          if (!res.success || !res.data) {
            throw new Error(res.error || res.message || "Failed to load")
          }
          const { correspondence, documents, history, clarification_requests, submission_responses } = res.data
          const rec = correspondence as Record<string, unknown>
          const hist = (history || []).map((h) => ({
            date: formatYmd(h.changed_at),
            stage: h.to_stage_code,
            note: h.notes || undefined,
          }))
          const docs: SGCDocument[] = (documents || []).map((d) => ({
            id: d.id,
            name: d.file_name,
            type: d.document_type_label || (d.mime_type?.includes("pdf") ? "PDF" : "File"),
            size: formatBytes(d.file_size),
            uploadedDate: formatYmd(d.uploaded_date),
            uploadedBy: "SGC",
          }))
          const trail = buildClarificationTrail(clarification_requests || [], submission_responses || [])
          if (!cancelled) {
            setDisplay({
              ...submission,
              submittedDate: formatYmd(rec.submitted_date as string) || submission.submittedDate,
              lastUpdated: formatYmd(rec.last_updated as string) || submission.lastUpdated,
              stage: (rec.stage as string) || submission.stage,
              history: hist,
              sgcDocuments: docs,
              clarificationTrail: trail,
            })
          }
        } else {
          const res = await fetchContractDetail(submission.id)
          if (!res.success || !res.data) {
            throw new Error(res.error || res.message || "Failed to load")
          }
          const { contract, documents, history, clarification_requests, submission_responses } = res.data
          const rec = contract as Record<string, unknown>
          const hist = (history || []).map((h) => ({
            date: formatYmd(h.changed_at),
            stage: h.to_stage_code,
            note: h.notes || undefined,
          }))
          const docs: SGCDocument[] = (documents || []).map((d) => ({
            id: d.id,
            name: d.file_name,
            type: d.document_type_label || (d.mime_type?.includes("pdf") ? "PDF" : "File"),
            size: formatBytes(d.file_size),
            uploadedDate: formatYmd(d.uploaded_date),
            uploadedBy: "SGC",
          }))
          const trail = buildClarificationTrail(clarification_requests || [], submission_responses || [])
          const lastRaw = (rec.last_updated as string) || (rec.updated_at as string)
          if (!cancelled) {
            setDisplay({
              ...submission,
              submittedDate: formatYmd(rec.submitted_date as string) || submission.submittedDate,
              lastUpdated: formatYmd(lastRaw) || submission.lastUpdated,
              stage: submission.stage,
              history: hist,
              sgcDocuments: docs,
              clarificationTrail: trail,
            })
          }
        }
      } catch (e) {
        if (!cancelled) setDetailError(e instanceof Error ? e.message : "Failed to load details")
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when identity changes
  }, [submission.id, submission.type, detailReloadKey])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitResponse = async () => {
    setIsSubmitting(true)
    try {
      if (uploadedFiles.length > 0) {
        await uploadSubmissionDocuments(submission.type, submission.id, uploadedFiles)
      }
      const res =
        submission.type === "correspondence"
          ? await submitCorrespondenceResponse(submission.id, {
              note: responseMessage.trim() || undefined,
            })
          : await submitContractResponse(submission.id, {
              note: responseMessage.trim() || undefined,
            })
      if (!res.success) throw new Error(res.error || res.message || "Failed to submit")
      setUploadedFiles([])
      setResponseMessage("")
      onAfterRespond?.()
      toast.success("Response submitted successfully! The SGC will be notified.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{display.transactionNumber}</span>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </DialogTitle>
        <DialogDescription>{display.title}</DialogDescription>
      </DialogHeader>

      {detailLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 shrink-0">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading details…
        </div>
      )}

      {detailError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 shrink-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{detailError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/40"
            onClick={() => setDetailReloadKey((k) => k + 1)}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents" className="relative">
            SGC Documents
            {display.sgcDocuments && display.sgcDocuments.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                {display.sgcDocuments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="respond"
            disabled={submission.status !== "clarification" && (!display.clarificationTrail || display.clarificationTrail.length === 0)}
          >
            Respond
            {display.clarificationTrail && display.clarificationTrail.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                {display.clarificationTrail.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{display.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="font-medium">{display.submittedDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{display.lastUpdated}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Current Stage</p>
              <p className="text-sm text-muted-foreground">
                {display.history && display.history.length > 0
                  ? display.history[display.history.length - 1].stage
                  : display.stage}
              </p>
            </div>

            {/* <div>
              <p className="text-sm font-medium text-foreground mb-3">History</p>
              {display.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              ) : (
                <div className="space-y-3">
                  {display.history.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            index === display.history.length - 1
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                        {index < display.history.length - 1 && (
                          <div className="w-px flex-1 bg-muted-foreground/20" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium text-foreground">{event.stage}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                        {event.note && (
                          <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Documents on file</p>
              <p className="text-xs text-muted-foreground">
                {display.sgcDocuments?.length || 0} document(s) available
              </p>
            </div>

            {display.sgcDocuments && display.sgcDocuments.length > 0 ? (
              <div className="space-y-2">
                {display.sgcDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.uploadedDate}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Uploaded by: {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => downloadDocumentAuthorized(doc.id, doc.name)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        type="button"
                        onClick={() => downloadDocumentAuthorized(doc.id, doc.name)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No documents available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Documents from the SGC will appear here when available
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="respond" className="flex-1 overflow-hidden mt-4 flex flex-col">
          {submission.status !== "clarification" && (!display.clarificationTrail || display.clarificationTrail.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No collaboration history</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Collaboration messages will appear here when the SGC returns your submission for clarification.
              </p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Chat trail */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
                {display.clarificationTrail && display.clarificationTrail.length > 0 ? (
                  display.clarificationTrail.map((msg) => (
                    <div
                      key={`${msg.sender}-${msg.id}`}
                      className={`flex ${msg.sender === "applicant" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === "sgc"
                            ? "bg-muted border"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-3 w-3 flex-shrink-0" />
                          <span className="text-xs font-semibold">
                            {msg.sender === "sgc" ? "SGC" : "You"}
                          </span>
                        </div>
                        {/* {msg.title && (
                          <p className={`text-xs font-medium mb-1 ${
                            msg.sender === "sgc" ? "text-muted-foreground" : "text-primary-foreground/80"
                          }`}>
                            {msg.title}
                          </p>
                        )} */}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        {msg.documents && msg.documents.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.documents.map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => downloadDocumentAuthorized(doc.id, doc.fileName)}
                                className="flex items-center gap-2 text-xs bg-background/80 border rounded px-2 py-1.5 hover:bg-background transition-colors w-full text-left cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                                <span className="truncate font-medium text-foreground">{doc.fileName}</span>
                                <span className="text-muted-foreground flex-shrink-0">
                                  {formatBytes(doc.fileSize)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        <p className={`text-xs mt-1.5 ${
                          msg.sender === "sgc" ? "text-muted-foreground" : "text-primary-foreground/70"
                        }`}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">No messages yet</p>
                  </div>
                )}
              </div>

              {/* Compose area - only when status is clarification */}
              {submission.status === "clarification" && (() => {
                const latestClarification = display.clarificationTrail
                  ? [...display.clarificationTrail]
                      .filter((m) => m.sender === "sgc")
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
                  : null
                const isResubmitMode =
                  submission.type === "contract" &&
                  latestClarification &&
                  (latestClarification as any).is_validated === false

                return (
                  <div className="border-t pt-3 space-y-3 flex-shrink-0">
                    {isResubmitMode ? (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                          <p className="font-medium mb-1">Full resubmission required</p>
                          <p className="text-xs">
                            The SGC has returned this application and requires you to edit and resubmit it with
                            the necessary corrections.
                          </p>
                        </div>
                        <Button
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => router.push(`/contracts?resubmit=${submission.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit &amp; Resubmit Application
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Textarea
                          id="response-message"
                          placeholder="Type your response to the SGC..."
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={2}
                          className="resize-none"
                        />

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4 mr-1" />
                            Attach
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          />
                          <div className="flex-1" />
                          <Button
                            size="sm"
                            onClick={handleSubmitResponse}
                            disabled={isSubmitting || (uploadedFiles.length === 0 && !responseMessage.trim())}
                          >
                            {isSubmitting ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </>
                            )}
                          </Button>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="space-y-1">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded bg-card text-sm"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">{formatBytes(file.size)}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DialogContent>
  )
}
