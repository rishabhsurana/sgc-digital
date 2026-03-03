"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, AlertCircle } from "lucide-react"

export interface UploadedFile {
  id: string
  file: File
  documentType: string
  description?: string
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  files: UploadedFile[]
  documentTypes: { value: string; label: string }[]
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export function FileUpload({
  onFilesChange,
  files,
  documentTypes,
  maxSize = 10,
  acceptedTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"],
  className
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File "${file.name}" exceeds ${maxSize}MB limit`
    }
    const extension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!acceptedTypes.includes(extension)) {
      return `File type "${extension}" is not supported`
    }
    return null
  }

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return
    
    setError(null)
    const validFiles: UploadedFile[] = []
    
    Array.from(newFiles).forEach(file => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      validFiles.push({
        id: crypto.randomUUID(),
        file,
        documentType: "",
        description: ""
      })
    })
    
    onFilesChange([...files, ...validFiles])
  }, [files, onFilesChange, maxSize, acceptedTypes])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id))
  }

  const updateFileType = (id: string, documentType: string) => {
    onFilesChange(files.map(f => f.id === id ? { ...f, documentType } : f))
  }

  const updateFileDescription = (id: string, description: string) => {
    onFilesChange(files.map(f => f.id === id ? { ...f, description } : f))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => addFiles(e.target.files)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max {maxSize}MB each)
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Uploaded Documents</Label>
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeFile(uploadedFile.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`type-${uploadedFile.id}`} className="text-xs">
                    Document Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={uploadedFile.documentType}
                    onValueChange={(value) => updateFileType(uploadedFile.id, value)}
                  >
                    <SelectTrigger id={`type-${uploadedFile.id}`} className="h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`desc-${uploadedFile.id}`} className="text-xs">
                    Description (Optional)
                  </Label>
                  <Input
                    id={`desc-${uploadedFile.id}`}
                    placeholder="Brief description"
                    value={uploadedFile.description}
                    onChange={(e) => updateFileDescription(uploadedFile.id, e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
