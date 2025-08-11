"use client"
import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { upload } from "@imagekit/next"

const VideoUpload = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/mov', 'video/avi']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid video file (MP4, MOV, AVI)')
      return
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size must be less than 100MB')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      // Get authentication parameters
      const authResponse = await fetch('/api/imagekit-auth')
      if (!authResponse.ok) {
        throw new Error('Failed to get upload authentication')
      }
      const authData = await authResponse.json()

      if (authData.error) {
        throw new Error(authData.error)
      }

      // Upload file using ImageKit v2
      const uploadResponse = await upload({
        file,
        fileName: `video-${Date.now()}-${file.name}`,
        folder: '/videos',
        ...authData
      })

      console.log("Upload successful:", uploadResponse)
      setUploadedVideos(prev => [...prev, uploadResponse])
      
      // Save video info to database
      await saveVideoToDatabase(uploadResponse)
      
    } catch (error) {
      console.error("Upload failed:", error)
      alert(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const saveVideoToDatabase = async (videoData: any) => {
    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoData.name,
          videoUrl: videoData.url,
          thumbnailUrl: videoData.thumbnailUrl,
          size: videoData.size,
          duration: videoData.duration,
          userId: session?.user?.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save video to database")
      }

      console.log("Video saved to database successfully")
      setMessage("Video uploaded successfully! Redirecting to videos page in 3 seconds...")
      
      // Keep uploading state during redirect
      setUploading(true)
      
      // Countdown and redirect
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          setMessage(`Video uploaded successfully! Redirecting to videos page in ${countdown} seconds...`);
        } else {
          clearInterval(countdownInterval);
          router.push("/dashboard/videos");
        }
      }, 1000);
    } catch (error) {
      console.error("Error saving video to database:", error)
      setMessage("Error saving video to database")
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-3xl font-bold text-white mb-6">Upload Video</h2>
      
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl text-white/50">🎬</div>
            <h3 className="text-xl font-semibold text-white">
              Drop your video here or click to browse
            </h3>
            <p className="text-white/70">
              Supports MP4, MOV, AVI up to 100MB
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/mp4,video/mov,video/avi"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed"
            >
              {uploading ? (
                message.includes("Redirecting") ? "Redirecting..." : "Uploading..."
              ) : "Choose Video File"}
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Success/Error Message */}
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

        {/* Recently Uploaded Videos */}
        {uploadedVideos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Recently Uploaded</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedVideos.map((video, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-white/50 text-4xl">🎥</span>
                  </div>
                  <h4 className="text-white font-medium truncate">{video.name}</h4>
                  <p className="text-white/60 text-sm">
                    {(video.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoUpload
