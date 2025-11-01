'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Cloud, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react'
import http from '@/lib/http'

interface FileState {
    file: File | null
    progress: number
    status: 'idle' | 'uploading' | 'success' | 'error'
    error: string | null
}

export default function UploadPage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const router = useRouter()
    const [fileState, setFileState] = useState<FileState>({
        file: null,
        progress: 0,
        status: 'idle',
        error: null,
    })
    const [dragActive, setDragActive] = useState(false)

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = ['.pdf', '.docx', '.doc']

    const validateFile = (file: File): string | null => {
        const fileName = file.name.toLowerCase()
        const isValidType = ALLOWED_TYPES.some((type) =>
            fileName.endsWith(type),
        )

        if (!isValidType) {
            return 'Invalid file type. Only PDF, DOCX, and DOC files are supported.'
        }

        if (file.size > MAX_FILE_SIZE) {
            return 'File size exceeds 10MB limit. Please upload a smaller file.'
        }

        return null
    }

    const handleFile = async (file: File) => {
        const error = validateFile(file)

        if (error) {
            setFileState({
                file: null,
                progress: 0,
                status: 'error',
                error,
            })
            return
        }

        // Simulate upload
        setFileState({
            file,
            progress: 0,
            status: 'uploading',
            error: null,
        })

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await http.post('/cv/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        )
                        setFileState((prev) => ({ ...prev, progress }))
                    }
                },
            })

            //lấy id
            const fileId = response.data?.data?.file_id

            // Upload thành công
            setFileState((prev) => ({
                ...prev,
                progress: 100,
                status: 'success',
            }))

            // Lưu thông tin file vào localStorage (nếu cần dùng cho bước xử lý tiếp)
            localStorage.setItem(
                'currentFile',
                JSON.stringify({
                    name: file.name,
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                    response: response.data, // dữ liệu trả về từ API
                }),
            )
            //cal api extract
            if (fileId) {
                console.log('Calling extract API for file:', fileId)
                const extractResponse = await http.post(`/cv/extract/${fileId}`)

                console.log('Extract result:', extractResponse.data)

                // Bạn có thể lưu extract data vào localStorage hoặc navigate
                localStorage.setItem(
                    'extractData',
                    JSON.stringify(extractResponse.data),
                )
            }
        } catch (err: any) {
            console.error(err)
            setFileState({
                file,
                progress: 0,
                status: 'error',
                error:
                    err.response?.data?.message ||
                    'Upload failed. Please try again later.',
            })
        }
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleReset = () => {
        setFileState({
            file: null,
            progress: 0,
            status: 'idle',
            error: null,
        })
    }

    const handleAnalyze = () => {
        // Mock: store file info and navigate to processing page
        localStorage.setItem(
            'currentFile',
            JSON.stringify({
                name: fileState.file?.name,
                size: fileState.file?.size,
                uploadedAt: new Date().toISOString(),
                fileId: Math.random().toString(36).substr(2, 9),
            }),
        )
        router.push('/dashboard/processing')
    }

    return (
        <div className='max-w-3xl mx-auto'>
            {/* Page Header */}
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    Upload Your CV
                </h1>
                <p className='text-gray-600'>
                    Upload your CV and let AI Coach analyze it for insights and
                    recommendations
                </p>
            </div>

            {/* Main Upload Card */}
            <Card className='border-0 shadow-lg mb-6'>
                <CardHeader>
                    <CardTitle className='text-xl'>Select CV File</CardTitle>
                    <CardDescription>
                        Drag and drop your CV or click to browse
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {fileState.status === 'idle' ||
                    fileState.status === 'error' ? (
                        <>
                            {/* Drag & Drop Zone */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                                    dragActive
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                                }`}
                            >
                                <Cloud
                                    className={`h-16 w-16 mx-auto mb-4 ${
                                        dragActive
                                            ? 'text-blue-600'
                                            : 'text-gray-400'
                                    }`}
                                />
                                <p className='text-lg font-semibold text-gray-900 mb-2'>
                                    Drag and drop your CV here
                                </p>
                                <p className='text-sm text-gray-600 mb-4'>
                                    PDF, DOCX, DOC (Max 10MB)
                                </p>
                            </div>

                            {/* File Input */}
                            <div className='mt-6'>
                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    className='hidden'
                                    accept='.pdf,.docx,.doc'
                                    onChange={handleFileInput}
                                />
                                <Button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3'
                                >
                                    <Upload className='h-4 w-4 mr-2' />
                                    Browse Files
                                </Button>
                            </div>

                            {/* Error Message */}
                            {fileState.error && (
                                <Alert className='mt-6 bg-red-50 border-red-200'>
                                    <AlertCircle className='h-4 w-4 text-red-600' />
                                    <AlertDescription className='text-red-700'>
                                        {fileState.error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    ) : null}

                    {/* Uploading State */}
                    {fileState.status === 'uploading' && (
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex-1'>
                                    <p className='text-sm font-medium text-gray-900'>
                                        {fileState.file?.name}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                        {(fileState.file?.size || 0) / 1024 >
                                        1024
                                            ? (
                                                  (fileState.file?.size || 0) /
                                                  (1024 * 1024)
                                              ).toFixed(2) + ' MB'
                                            : (
                                                  (fileState.file?.size || 0) /
                                                  1024
                                              ).toFixed(2) + ' KB'}
                                    </p>
                                </div>
                                <Button variant='ghost' size='sm' disabled>
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                                <div
                                    className='bg-blue-600 h-full transition-all duration-300'
                                    style={{ width: `${fileState.progress}%` }}
                                />
                            </div>
                            <p className='text-sm text-gray-600 text-center'>
                                Uploading... {Math.round(fileState.progress)}%
                            </p>
                        </div>
                    )}

                    {/* Success State */}
                    {fileState.status === 'success' && (
                        <div className='space-y-4'>
                            <div className='flex items-start gap-4 bg-green-50 border border-green-200 rounded-lg p-4'>
                                <CheckCircle2 className='h-6 w-6 text-green-600 flex-shrink-0 mt-0.5' />
                                <div className='flex-1'>
                                    <p className='font-semibold text-green-900'>
                                        File uploaded successfully!
                                    </p>
                                    <p className='text-sm text-green-700 mt-1'>
                                        Ready to extract and analyze your CV
                                    </p>
                                </div>
                            </div>

                            {/* File Info Card */}
                            <Card className='bg-gray-50 border-gray-200'>
                                <CardContent className='pt-6'>
                                    <div className='grid grid-cols-3 gap-4'>
                                        <div>
                                            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                File Name
                                            </p>
                                            <p className='text-sm font-semibold text-gray-900 truncate mt-1'>
                                                {fileState.file?.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                File Size
                                            </p>
                                            <p className='text-sm font-semibold text-gray-900 mt-1'>
                                                {fileState.file?.size &&
                                                fileState.file.size / 1024 >
                                                    1024
                                                    ? (
                                                          fileState.file.size /
                                                          (1024 * 1024)
                                                      ).toFixed(2) + ' MB'
                                                    : (
                                                          (fileState.file
                                                              ?.size || 0) /
                                                          1024
                                                      ).toFixed(2) + ' KB'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Uploaded
                                            </p>
                                            <p className='text-sm font-semibold text-gray-900 mt-1'>
                                                Just now
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            {/* <div className='flex gap-3 pt-2'>
                                <Button
                                    onClick={handleAnalyze}
                                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg'
                                >
                                    Extract & Analyze CV
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant='outline'
                                    className='flex-1 border-gray-300 bg-transparent'
                                >
                                    Upload Another
                                </Button>
                            </div> */}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Support Info */}
            <Card className='bg-blue-50 border-blue-200'>
                <CardContent className='pt-6'>
                    <div className='flex gap-4'>
                        <AlertCircle className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5' />
                        <div>
                            <p className='font-semibold text-blue-900 text-sm'>
                                Supported file formats
                            </p>
                            <p className='text-sm text-blue-700 mt-1'>
                                We support PDF, DOCX, and DOC formats. Maximum
                                file size is 10MB.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
