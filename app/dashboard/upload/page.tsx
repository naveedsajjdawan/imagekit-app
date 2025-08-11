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
    
    if ((session.user as any)?.passwordRequiresReset) {
      router.push("/update-password");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">Upload Content</h1>
          <p className="mt-2 text-black/80">Upload videos and photos to your library.</p>
        </div>

        {/* Upload Type Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-300">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('video')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors rounded-t-lg ${
                  activeTab === 'video'
                    ? 'border-purple-500 text-purple-600 bg-white/50'
                    : 'border-transparent text-black/60 hover:text-black hover:border-gray-300'
                }`}
              >
                🎥 Upload Video
              </button>
              <button
                onClick={() => setActiveTab('photo')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors rounded-t-lg ${
                  activeTab === 'photo'
                    ? 'border-purple-500 text-purple-600 bg-white/50'
                    : 'border-transparent text-black/60 hover:text-black hover:border-gray-300'
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
        <div className="mt-8 bg-white/90 backdrop-blur-lg border border-white/40 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-medium text-black mb-3">Upload Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black/70">
            <div>
              <h4 className="font-medium mb-2 text-black">For Videos:</h4>
              <ul className="space-y-1">
                <li>• Supported formats: MP4, AVI, MOV</li>
                <li>• Maximum file size: 100MB</li>
                <li>• Add descriptive titles and descriptions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-black">For Photos:</h4>
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
