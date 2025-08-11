"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "./FileUpload";

interface PhotoUploadProps {
  onPhotoUploaded?: () => void;
}

const PhotoUpload = ({ onPhotoUploaded }: PhotoUploadProps) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  const handlePhotoSuccess = async (uploadResult: any) => {
    try {
      setUploading(true);
      
      const photoData = {
        title: title || `Photo ${new Date().toLocaleString()}`,
        description: description,
        imageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
        size: uploadResult.size || 0,
        width: uploadResult.width,
        height: uploadResult.height
      };

      const response = await fetch("/api/photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(photoData),
      });

      if (response.ok) {
        setMessage("Photo uploaded successfully! Redirecting to photos page in 3 seconds...");
        setTitle("");
        setDescription("");
        onPhotoUploaded?.();
        
        // Show redirecting state
        setUploading(true);
        
        // Countdown and redirect
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            setMessage(`Photo uploaded successfully! Redirecting to photos page in ${countdown} seconds...`);
          } else {
            clearInterval(countdownInterval);
            router.push("/dashboard/photos");
          }
        }, 1000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      setMessage("Error saving photo metadata");
    } finally {
      // Don't set uploading to false immediately if redirecting
      if (!message.includes("Redirecting")) {
        setUploading(false);
      }
    }
  };

  const handleProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-3xl font-bold text-white mb-6">Upload Photo</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            Photo Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter photo title"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter photo description"
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Select Photo
          </label>
          <FileUpload
            fileType="image"
            onSuccess={handlePhotoSuccess}
            onProgress={handleProgress}
            className="w-full"
          />
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-lg border ${
            message.includes("Error") 
              ? "bg-red-500/20 text-red-200 border-red-500/30" 
              : "bg-green-500/20 text-green-200 border-green-500/30"
          }`}>
            <div className="flex items-center justify-between">
              <span>{message}</span>
              {message.includes("Redirecting") && !message.includes("Error") && (
                <button
                  onClick={() => {
                    setMessage("");
                    setUploading(false);
                  }}
                  className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-md transition"
                >
                  Skip redirect
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
