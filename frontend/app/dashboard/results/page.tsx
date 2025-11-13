"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, ChevronDown, Copy, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock CV analysis data
const mockAnalysisData = {
  basicInfo: {
    name: "John Alexander Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "San Francisco, CA, USA",
    dateOfBirth: "1990-05-15",
    gender: "Male",
  },
  education: [
    {
      id: 1,
      school: "Stanford University",
      degree: "Master of Science",
      major: "Computer Science",
      graduationDate: "2015-05-20",
      gpa: 3.8,
    },
    {
      id: 2,
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      major: "Computer Science",
      graduationDate: "2013-05-20",
      gpa: 3.9,
    },
  ],
  experience: [
    {
      id: 1,
      company: "Tech Innovations Inc.",
      position: "Senior Software Engineer",
      startDate: "2019-01-15",
      endDate: "2024-12-31",
      description:
        "Led development of microservices architecture, improved system performance by 40%, mentored junior engineers",
      technologies: ["React", "Node.js", "AWS", "Docker", "PostgreSQL"],
    },
    {
      id: 2,
      company: "Digital Solutions Corp",
      position: "Software Engineer",
      startDate: "2015-06-01",
      endDate: "2019-01-14",
      description:
        "Developed full-stack web applications, implemented CI/CD pipelines, collaborated with cross-functional teams",
      technologies: ["React", "TypeScript", "Python", "Jenkins", "MongoDB"],
    },
  ],
  skills: [
    { id: 1, name: "React", category: "Technical", level: 95 },
    { id: 2, name: "TypeScript", category: "Technical", level: 90 },
    { id: 3, name: "Node.js", category: "Technical", level: 88 },
    { id: 4, name: "AWS", category: "Technical", level: 85 },
    { id: 5, name: "Python", category: "Technical", level: 82 },
    { id: 6, name: "Problem Solving", category: "Soft Skills", level: 95 },
    { id: 7, name: "Leadership", category: "Soft Skills", level: 88 },
    { id: 8, name: "Communication", category: "Soft Skills", level: 90 },
  ],
  certificates: [
    {
      id: 1,
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2021-03-15",
      certificateId: "AWS-SAA-2021-001",
    },
    {
      id: 2,
      name: "Google Cloud Professional Data Engineer",
      issuer: "Google Cloud",
      issueDate: "2020-09-20",
      certificateId: "GCP-DE-2020-456",
    },
  ],
  languages: [
    { id: 1, name: "English", proficiency: "Native", score: null },
    { id: 2, name: "Spanish", proficiency: "Intermediate", score: "DELE B1" },
    { id: 3, name: "Mandarin", proficiency: "Elementary", score: null },
  ],
  rawText:
    "JOHN ALEXANDER SMITH\nEmail: john.smith@email.com | Phone: +1 (555) 123-4567\nSan Francisco, CA, USA\n\nEDUCATION\nMaster of Science in Computer Science\nStanford University | May 2015 | GPA: 3.8/4.0\n\nBachelor of Science in Computer Science\nUniversity of California, Berkeley | May 2013 | GPA: 3.9/4.0\n\nEXPERIENCE\nSenior Software Engineer\nTech Innovations Inc. | January 2019 - December 2024\n- Led development of microservices architecture\n- Improved system performance by 40%\n- Mentored 5+ junior engineers\n\nSoftware Engineer\nDigital Solutions Corp | June 2015 - January 2019\n- Developed full-stack web applications\n- Implemented CI/CD pipelines\n- Collaborated with cross-functional teams",
}

export default function ResultsPage() {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    education: true,
    experience: true,
    skills: true,
    certificates: false,
    languages: false,
    rawText: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const downloadPDF = () => {
    alert("PDF download feature - would integrate with a PDF generation library")
  }

  const exportJSON = () => {
    const dataStr = JSON.stringify(mockAnalysisData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cv-analysis.json"
    link.click()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6 text-gray-600" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">CV Analysis Results</h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPDF}
            className="flex items-center gap-2 border-gray-300 bg-transparent"
          >
            <Download className="h-4 w-4" />
            PDF Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportJSON}
            className="flex items-center gap-2 border-gray-300 bg-transparent"
          >
            <Download className="h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2 border-gray-300 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Avatar & Basic Info Section */}
      <Card className="border-0 shadow-lg mb-8">
        <CardContent className="pt-8">
          <div className="flex gap-8 items-start">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-gray-200 flex-shrink-0">
              <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                {mockAnalysisData.basicInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            {/* Basic Info Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalysisData.basicInfo.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <a
                  href={`mailto:${mockAnalysisData.basicInfo.email}`}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {mockAnalysisData.basicInfo.email}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{mockAnalysisData.basicInfo.phone}</span>
                  <button
                    onClick={() => copyToClipboard(mockAnalysisData.basicInfo.phone)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Location</p>
                <p className="font-medium text-gray-900">{mockAnalysisData.basicInfo.address}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="font-medium text-gray-900">
                  {new Date(mockAnalysisData.basicInfo.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Gender</p>
                <p className="font-medium text-gray-900">{mockAnalysisData.basicInfo.gender}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="cursor-pointer border-b border-gray-200" onClick={() => toggleSection("education")}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Education</CardTitle>
              <CardDescription>{mockAnalysisData.education.length} degrees</CardDescription>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 transition-transform ${
                expandedSections.education ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>

        {expandedSections.education && (
          <CardContent className="pt-6 space-y-4">
            {mockAnalysisData.education.map((edu) => (
              <div key={edu.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{edu.school}</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {edu.degree} in {edu.major}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {edu.degree.split(" ")[0]}
                  </span>
                </div>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>Graduated: {new Date(edu.graduationDate).toLocaleDateString()}</span>
                  {edu.gpa && <span>GPA: {edu.gpa.toFixed(1)}/4.0</span>}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Work Experience Section */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="cursor-pointer border-b border-gray-200" onClick={() => toggleSection("experience")}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Work Experience</CardTitle>
              <CardDescription>{mockAnalysisData.experience.length} positions</CardDescription>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 transition-transform ${
                expandedSections.experience ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>

        {expandedSections.experience && (
          <CardContent className="pt-6 space-y-4">
            {mockAnalysisData.experience.map((exp) => {
              const startDate = new Date(exp.startDate)
              const endDate = new Date(exp.endDate)
              const durationMonths = Math.round(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44),
              )
              const years = Math.floor(durationMonths / 12)
              const months = durationMonths % 12

              return (
                <div key={exp.id} className="border-l-4 border-blue-600 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{exp.position}</h4>
                      <p className="text-sm text-gray-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                      {years}y {months}m
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{exp.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </p>
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>

      {/* Skills Section */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="cursor-pointer border-b border-gray-200" onClick={() => toggleSection("skills")}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Skills</CardTitle>
              <CardDescription>Technical and soft skills</CardDescription>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 transition-transform ${
                expandedSections.skills ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>

        {expandedSections.skills && (
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Technical Skills */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Technical Skills</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAnalysisData.skills
                    .filter((s) => s.category === "Technical")
                    .map((skill) => (
                      <div
                        key={skill.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          <span className="text-sm font-bold text-blue-600">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Soft Skills</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAnalysisData.skills
                    .filter((s) => s.category === "Soft Skills")
                    .map((skill) => (
                      <div
                        key={skill.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          <span className="text-sm font-bold text-green-600">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-full rounded-full transition-all"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Certificates & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Certificates */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="cursor-pointer border-b border-gray-200" onClick={() => toggleSection("certificates")}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Certificates</CardTitle>
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform ${
                  expandedSections.certificates ? "transform rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>

          {expandedSections.certificates && (
            <CardContent className="pt-4 space-y-3">
              {mockAnalysisData.certificates.map((cert) => (
                <div key={cert.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-gray-900 text-sm">{cert.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{cert.issuer}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {cert.certificateId}</p>
                  <p className="text-xs text-gray-500">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Languages */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="cursor-pointer border-b border-gray-200" onClick={() => toggleSection("languages")}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Languages</CardTitle>
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform ${
                  expandedSections.languages ? "transform rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>

          {expandedSections.languages && (
            <CardContent className="pt-4 space-y-3">
              {mockAnalysisData.languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{lang.name}</p>
                    <p className="text-xs text-gray-600">{lang.proficiency}</p>
                  </div>
                  {lang.score && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {lang.score}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Raw Text Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="cursor-pointer border-b border-gray-200" onClick={() => toggleSection("rawText")}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Raw Extracted Text</CardTitle>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 transition-transform ${
                expandedSections.rawText ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>

        {expandedSections.rawText && (
          <CardContent className="pt-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {mockAnalysisData.rawText.length} characters • {mockAnalysisData.rawText.split(" ").length} words
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(mockAnalysisData.rawText)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Copy className="h-4 w-4" />
                  Copy Text
                </button>
              </div>
              <textarea
                readOnly
                value={mockAnalysisData.rawText}
                className="w-full h-48 p-3 bg-white border border-gray-200 rounded text-sm text-gray-600 resize-none focus:outline-none"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Footer Actions */}
      <div className="mt-8 flex gap-3 justify-center">
        <Button onClick={() => router.push("/dashboard/upload")} variant="outline" className="border-gray-300">
          Upload Another CV
        </Button>
        <Button onClick={() => router.push("/dashboard/history")} className="bg-blue-600 hover:bg-blue-700 text-white">
          View History
        </Button>
      </div>
    </div>
  )
}
