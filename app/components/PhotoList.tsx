"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image"

interface Photo {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

const PhotoList = () => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/photo")
      
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      } else {
        setError("Failed to fetch photos")
      }
    } catch (error) {
      console.error("Error fetching photos:", error)
      setError("Error fetching photos")
    } finally {
      setLoading(false)
    }
  }

  const deletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      const response = await fetch(`/api/photo/${photoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPhotos(photos.filter(photo => photo._id !== photoId));
      } else {
        setError("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      setError("Error deleting photo");
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPhotos}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No photos uploaded yet</p>
        <p className="text-gray-400">Start by uploading your first photo!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Photos</h2>
        <button
          onClick={fetchPhotos}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={photo.thumbnailUrl || photo.imageUrl}
                alt={photo.title}
                fill
                unoptimized
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">
                {photo.title}
              </h3>
              
              {photo.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {photo.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{formatFileSize(photo.size)}</span>
                {photo.width && photo.height && (
                  <span>{photo.width} × {photo.height}</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <a
                  href={photo.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  View
                </a>
                <button
                  onClick={() => deletePhoto(photo._id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PhotoList
