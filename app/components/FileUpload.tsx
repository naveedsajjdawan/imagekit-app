/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { upload } from "@imagekit/next";
import React, { useState } from "react";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
  className?: string;
}

const FileUpload = ({ onSuccess, onProgress, fileType, className }: FileUploadProps) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // File validation
    const validateFile = (file: File) => {
      if(fileType === 'video') {
        if(!file.type.startsWith("video/")) {
          setError("Please upload a valid video file")
          return false
        }
      } else if(fileType === 'image') {
        if(!file.type.startsWith("image/")) {
          setError("Please upload a valid image file")
          return false
        }
      }
      
      if(file.size > 100 * 1024 * 1024) {
        setError("File size should be less than 100MB")
        return false
      }
      
      setError(null)
      return true
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if(!file || !validateFile(file)) return
      
      setUploading(true)
      setError(null)

      try {
        const authRes = await fetch("/api/imagekit-auth")
        if (!authRes.ok) {
          throw new Error('Failed to get upload authentication')
        }
        
        const authData = await authRes.json()
        
        if (authData.error) {
          throw new Error(authData.error)
        }

        // Upload file using ImageKit v2
        const res = await upload({
          file,
          fileName: `${fileType}-${Date.now()}-${file.name}`,
          folder: `/${fileType}s`,
          publicKey: authData.publicKey,
          ...authData
        })
        
        onSuccess(res)
      } catch (error) {
        console.error("Upload error:", error)
        setError(error instanceof Error ? error.message : "Upload failed. Please try again.")
      } finally {
        setUploading(false)
      }
    }

    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                  <span className="text-sm text-white">Uploading...</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-4 text-white/50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-white/70">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-white/50">
                    {fileType === 'video' ? 'MP4, AVI, MOV up to 100MB' : 'PNG, JPG, GIF up to 100MB'}
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept={fileType === 'image' ? 'image/*' : 'video/*'} 
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
        
        {error && (
          <div className="mt-3 text-sm text-red-300 bg-red-500/20 p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}
      </div>
    )
}

export default FileUpload