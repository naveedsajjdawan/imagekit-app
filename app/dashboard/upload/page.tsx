"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import VideoUpload from "../../components/VideoUpload";
import PhotoUpload from "../../components/PhotoUpload";

const UploadPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'video' | 'photo'>('video');

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Upload Content</h1>
          <p className="mt-2 text-white/70">Upload videos and photos to your library.</p>
        </div>

        {/* Upload Type Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('video')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors rounded-t-lg ${
                  activeTab === 'video'
                    ? 'border-purple-500 text-purple-400 bg-white/5'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                🎥 Upload Video
              </button>
              <button
                onClick={() => setActiveTab('photo')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors rounded-t-lg ${
                  activeTab === 'photo'
                    ? 'border-purple-500 text-purple-400 bg-white/5'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                📸 Upload Photo
              </button>
            </nav>
          </div>
        </div>

        {/* Upload Content */}
        <div className="bg-transparent">
          {activeTab === 'video' ? (
            <VideoUpload />
          ) : (
            <PhotoUpload />
          )}
        </div>

        {/* Upload Tips */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-3">Upload Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
            <div>
              <h4 className="font-medium mb-2 text-white">For Videos:</h4>
              <ul className="space-y-1">
                <li>• Supported formats: MP4, AVI, MOV</li>
                <li>• Maximum file size: 100MB</li>
                <li>• Add descriptive titles and descriptions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-white">For Photos:</h4>
              <ul className="space-y-1">
                <li>• Supported formats: JPG, PNG, GIF</li>
                <li>• Maximum file size: 100MB</li>
                <li>• Use tags to organize your photos</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
