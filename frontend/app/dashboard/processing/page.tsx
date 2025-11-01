"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Loader2, FileText, Briefcase, Zap, Award } from "lucide-react"

interface ProcessingStep {
  id: "extraction" | "analysis"
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "failed"
  progress?: number
  timestamp?: string
  subSteps?: {
    id: string
    title: string
    icon: React.ReactNode
    status: "pending" | "processing" | "completed"
  }[]
  error?: string
  duration?: string
}

export default function ProcessingPage() {
  const router = useRouter()
  const [currentFile, setCurrentFile] = useState<any>(null)
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: "extraction",
      title: "Extracting Text & Image",
      description: "Reading CV content and extracting text and avatar image",
      status: "processing",
      progress: 0,
      subSteps: [],
    },
    {
      id: "analysis",
      title: "AI Analysis",
      description: "Analyzing CV with AI to extract structured information",
      status: "pending",
      progress: 0,
      subSteps: [
        {
          id: "basic-info",
          title: "Basic Info & Education",
          icon: <FileText className="h-4 w-4" />,
          status: "pending",
        },
        { id: "experience", title: "Work Experience", icon: <Briefcase className="h-4 w-4" />, status: "pending" },
        { id: "skills", title: "Skills Assessment", icon: <Zap className="h-4 w-4" />, status: "pending" },
        { id: "certs", title: "Certificates & Languages", icon: <Award className="h-4 w-4" />, status: "pending" },
      ],
    },
  ])
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Load file info from localStorage
    const fileStr = localStorage.getItem("currentFile")
    if (fileStr) {
      setCurrentFile(JSON.parse(fileStr))
    }

    // Simulate processing steps
    let step1Complete = false
    const step2Index = 0

    const interval = setInterval(() => {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps]

        // Step 1: Text Extraction (0-30s)
        if (!step1Complete && newSteps[0].progress! < 100) {
          const newProgress = Math.min(newSteps[0].progress! + Math.random() * 15, 100)
          newSteps[0].progress = newProgress

          if (newProgress >= 100) {
            step1Complete = true
            newSteps[0].status = "completed"
            newSteps[0].timestamp = new Date().toLocaleTimeString()
            newSteps[0].duration = "15s"
            // Start step 2
            newSteps[1].status = "processing"
          }
        }
        // Step 2: AI Analysis (30-60s)
        else if (step1Complete && newSteps[1].progress! < 100) {
          const newProgress = Math.min(newSteps[1].progress! + Math.random() * 12, 100)
          newSteps[1].progress = newProgress

          // Update sub-steps
          const completedCount = Math.floor((newProgress / 100) * 4)
          if (newSteps[1].subSteps) {
            newSteps[1].subSteps = newSteps[1].subSteps.map((sub, idx) => ({
              ...sub,
              status: idx < completedCount - 1 ? "completed" : idx === completedCount - 1 ? "processing" : "pending",
            }))
          }

          if (newProgress >= 100) {
            newSteps[1].status = "completed"
            newSteps[1].timestamp = new Date().toLocaleTimeString()
            newSteps[1].duration = "45s"
            setIsComplete(true)
          }
        }

        return newSteps
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const handleViewResults = () => {
    router.push("/dashboard/results")
  }

  const handleRetry = () => {
    router.push("/dashboard/upload")
  }

  if (hasError) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6 text-gray-600" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h2>
            <p className="text-gray-600 mb-6">An error occurred while processing your CV. Please try again.</p>
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push("/dashboard/upload")}
                variant="outline"
                className="w-full border-gray-300"
              >
                Upload New File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6 text-gray-600" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing CV: {currentFile?.name || "Your File"}</h1>
        <p className="text-gray-600">Please wait while we extract and analyze your CV</p>
      </div>

      {/* File Info Card */}
      <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-blue-50 to-slate-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</p>
              <p className="text-sm font-semibold text-gray-900 truncate mt-1">{currentFile?.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {currentFile?.size && currentFile.size / 1024 > 1024
                  ? (currentFile.size / (1024 * 1024)).toFixed(2) + " MB"
                  : ((currentFile?.size || 0) / 1024).toFixed(2) + " KB"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {currentFile?.uploadedAt ? new Date(currentFile.uploadedAt).toLocaleTimeString() : "Just now"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Timeline */}
      <div className="space-y-6">
        {steps.map((step, stepIndex) => (
          <Card key={step.id} className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === "pending"
                        ? "bg-gray-200 text-gray-500"
                        : step.status === "processing"
                          ? "bg-blue-100 text-blue-600"
                          : step.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                    }`}
                  >
                    {step.status === "pending" && <Clock className="h-6 w-6" />}
                    {step.status === "processing" && <Loader2 className="h-6 w-6 animate-spin" />}
                    {step.status === "completed" && <CheckCircle2 className="h-6 w-6" />}
                    {step.status === "failed" && <AlertCircle className="h-6 w-6" />}
                  </div>
                  {stepIndex < steps.length - 1 && (
                    <div className={`w-1 h-16 mt-2 ${step.status === "completed" ? "bg-green-300" : "bg-gray-300"}`} />
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 pb-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>

                  {/* Progress Bar */}
                  {(step.status === "processing" || step.status === "pending") && step.progress !== undefined && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            step.status === "processing" ? "bg-blue-600" : "bg-gray-400"
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {step.status === "processing"
                          ? `Processing... ${Math.round(step.progress)}%`
                          : "Waiting to start..."}
                      </p>
                    </div>
                  )}

                  {/* Sub-steps for Analysis */}
                  {step.subSteps && step.subSteps.length > 0 && step.status !== "pending" && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4 space-y-2">
                      {step.subSteps.map((subStep) => (
                        <div key={subStep.id} className="flex items-center gap-3">
                          <div
                            className={`flex-shrink-0 ${
                              subStep.status === "completed"
                                ? "text-green-600"
                                : subStep.status === "processing"
                                  ? "text-blue-600 animate-spin"
                                  : "text-gray-400"
                            }`}
                          >
                            {subStep.status === "processing" ? <Loader2 className="h-4 w-4" /> : subStep.icon}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              subStep.status === "completed"
                                ? "text-gray-900"
                                : subStep.status === "processing"
                                  ? "text-blue-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {subStep.title}
                          </span>
                          {subStep.status === "completed" && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  {step.status === "completed" && step.timestamp && (
                    <div className="flex gap-4 text-xs text-gray-500 mt-3">
                      <span>Completed at {step.timestamp}</span>
                      {step.duration && <span>Duration: {step.duration}</span>}
                    </div>
                  )}

                  {/* Error Message */}
                  {step.status === "failed" && step.error && (
                    <Alert className="mt-3 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{step.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion State */}
      {isComplete && (
        <div className="mt-8 space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              CV processed successfully! Your analysis is ready to view.
            </AlertDescription>
          </Alert>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Duration</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">60s</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Text Extracted</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">2,456 chars</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis Status</p>
                  <p className="text-lg font-bold text-green-600 mt-1">5/5 Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleViewResults}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-lg"
          >
            View Analysis Results
          </Button>
        </div>
      )}
    </div>
  )
}
