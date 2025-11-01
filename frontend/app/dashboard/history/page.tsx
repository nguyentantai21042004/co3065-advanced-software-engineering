"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Eye,
  Download,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Grid3x3,
  List,
} from "lucide-react"

interface CVFile {
  id: string
  fileName: string
  candidateName: string
  uploadDate: string
  status: "completed" | "processing" | "failed"
  fileSize: number
}

// Mock CV history data
const mockCVs: CVFile[] = [
  {
    id: "1",
    fileName: "john_smith_resume.pdf",
    candidateName: "John Smith",
    uploadDate: "2024-12-28",
    status: "completed",
    fileSize: 245000,
  },
  {
    id: "2",
    fileName: "jane_doe_cv.docx",
    candidateName: "Jane Doe",
    uploadDate: "2024-12-27",
    status: "completed",
    fileSize: 156000,
  },
  {
    id: "3",
    fileName: "robert_johnson.pdf",
    candidateName: "Robert Johnson",
    uploadDate: "2024-12-26",
    status: "processing",
    fileSize: 312000,
  },
  {
    id: "4",
    fileName: "emily_brown_resume.doc",
    candidateName: "Emily Brown",
    uploadDate: "2024-12-25",
    status: "failed",
    fileSize: 198000,
  },
  {
    id: "5",
    fileName: "michael_wilson_cv.pdf",
    candidateName: "Michael Wilson",
    uploadDate: "2024-12-24",
    status: "completed",
    fileSize: 287000,
  },
  {
    id: "6",
    fileName: "sarah_davis.docx",
    candidateName: "Sarah Davis",
    uploadDate: "2024-12-23",
    status: "completed",
    fileSize: 164000,
  },
]

export default function HistoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "processing" | "failed">("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedCVs, setSelectedCVs] = useState<Set<string>>(new Set())

  // Filter and search CVs
  const filteredCVs = useMemo(() => {
    return mockCVs.filter((cv) => {
      const matchesSearch =
        cv.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cv.candidateName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || cv.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        )
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            <Clock className="h-3 w-3 animate-spin" />
            Processing
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        )
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes > 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB"
    }
    return (bytes / 1024).toFixed(2) + " KB"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleDelete = (id: string) => {
    alert(`Would delete CV: ${id}`)
  }

  const handleBulkDelete = () => {
    if (selectedCVs.size > 0) {
      alert(`Would delete ${selectedCVs.size} CVs`)
      setSelectedCVs(new Set())
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CV History</h1>
        <p className="text-gray-600">Manage and view all your processed CVs</p>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by file name or candidate name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <div className="flex gap-2">
                  {["all", "completed", "processing", "failed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        statusFilter === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 transition-colors ${
                    viewMode === "table" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCVs.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCVs.size} CV{selectedCVs.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCVs(new Set())}
                    className="border-blue-300"
                  >
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div>
          {filteredCVs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCVs.map((cv) => (
                <Card key={cv.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <CardContent className="pt-6">
                    {/* Checkbox */}
                    <div className="mb-4 flex items-start justify-between">
                      <input
                        type="checkbox"
                        checked={selectedCVs.has(cv.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedCVs)
                          if (e.target.checked) {
                            newSet.add(cv.id)
                          } else {
                            newSet.delete(cv.id)
                          }
                          setSelectedCVs(newSet)
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push("/dashboard/results")}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Results
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(cv.id)} className="text-red-600 cursor-pointer">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 bg-blue-600 text-white">
                        <AvatarFallback className="bg-blue-600 text-white font-semibold">
                          {cv.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{cv.candidateName}</p>
                        <p className="text-xs text-gray-500 truncate">{cv.fileName}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-4">{getStatusBadge(cv.status)}</div>

                    {/* Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Upload Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(cv.uploadDate)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>File Size:</span>
                        <span className="font-medium text-gray-900">{formatFileSize(cv.fileSize)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {cv.status === "completed" && (
                      <Button
                        onClick={() => router.push("/dashboard/results")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm"
                      >
                        View Results
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No CVs found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first CV to get started"}
              </p>
              <Button
                onClick={() => router.push("/dashboard/upload")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
              >
                Upload CV
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCVs.size === filteredCVs.length && filteredCVs.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCVs(new Set(filteredCVs.map((cv) => cv.id)))
                        } else {
                          setSelectedCVs(new Set())
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCVs.map((cv) => (
                  <tr key={cv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCVs.has(cv.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedCVs)
                          if (e.target.checked) {
                            newSet.add(cv.id)
                          } else {
                            newSet.delete(cv.id)
                          }
                          setSelectedCVs(newSet)
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-blue-600 text-white">
                          <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">
                            {cv.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">{cv.candidateName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate">{cv.fileName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(cv.uploadDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(cv.fileSize)}</td>
                    <td className="px-6 py-4">{getStatusBadge(cv.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {cv.status === "completed" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => router.push("/dashboard/results")}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Results
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(cv.id)} className="text-red-600 cursor-pointer">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Info */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Showing {filteredCVs.length} of {mockCVs.length} CVs
        </p>
      </div>
    </div>
  )
}
