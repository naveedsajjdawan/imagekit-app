"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Video {
  _id: string
  title: string
  url?: string
  videoUrl?: string
  thumbnail?: string
  thumbnailUrl?: string
  size: number
  duration?: number
  userId: string
  createdAt: string
}

const VideoList = () => {
  const { data: session } = useSession()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/video")
      
      if (!response.ok) {
        throw new Error("Failed to fetch videos")
      }
      
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (error) {
      console.error("Error fetching videos:", error)
      setError("Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return
    
    try {
      const response = await fetch(`/api/video/${videoId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete video")
      }
      
      setVideos(prev => prev.filter(video => video._id !== videoId))
      alert("Video deleted successfully")
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("Failed to delete video")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return "Unknown"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-center text-white">
          <div className="text-2xl">Loading videos...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-center text-white">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <button
            onClick={fetchVideos}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">My Videos</h2>
        <button
          onClick={fetchVideos}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl text-white/30 mb-4">🎬</div>
          <h3 className="text-xl text-white/70 mb-2">No videos yet</h3>
          <p className="text-white/50">Upload your first video to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const thumb = video.thumbnailUrl || video.thumbnail
            const href = video.videoUrl || video.url
            return (
              <div key={video._id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gray-800 relative group">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/50 text-4xl">🎥</span>
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => href && window.open(href, '_blank')}
                      disabled={!href}
                      className="bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white p-3 rounded-full backdrop-blur-sm transition"
                    >
                      ▶️
                    </button>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 truncate">
                    {video.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(video.size)}</span>
                    </div>
                    
                    {video.duration && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => href && window.open(href, '_blank')}
                      disabled={!href}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition"
                    >
                      Watch
                    </button>
                    <button
                      onClick={() => deleteVideo(video._id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VideoList
