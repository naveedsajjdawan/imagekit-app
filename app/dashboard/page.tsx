"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";

type RecentItem = {
  _id: string
  type: 'video' | 'photo'
  title: string
  createdAt: string
}

interface DashboardStats {
  videoCount: number;
  photoCount: number;
  totalSize: number;
  maxStorage: number;
}

const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({ 
    videoCount: 0, 
    photoCount: 0, 
    totalSize: 0, 
    maxStorage: 100 * 1024 * 1024 
  });
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    // If password needs reset, redirect to update page
    if (session.user && (session.user as any).passwordRequiresReset) {
      router.push("/update-password");
      return;
    }

    fetchDashboardStats();
  }, [session, status, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [videoResponse, photoResponse] = await Promise.all([
        fetch("/api/video"),
        fetch("/api/photo")
      ])
      const videoData = videoResponse.ok ? await videoResponse.json() : { videos: [] };
      const photoData = photoResponse.ok ? await photoResponse.json() : { photos: [] };
      
      const videos = videoData.videos || [];
      const photos = photoData.photos || [];
      
      const totalSize = [...videos, ...photos].reduce((acc: number, item: any) => acc + (item.size || 0), 0);
      
      setStats({
        videoCount: videos.length,
        photoCount: photos.length,
        totalSize,
        maxStorage: 100 * 1024 * 1024 // 100MB
      });

      // Build recent items (last 5 by createdAt)
      const recentMerged: RecentItem[] = [
        ...videos.map((v: any) => ({ _id: v._id, type: 'video' as const, title: v.title, createdAt: v.createdAt })),
        ...photos.map((p: any) => ({ _id: p._id, type: 'photo' as const, title: p.title, createdAt: p.createdAt })),
      ]
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0,5)

      setRecent(recentMerged)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const displayName = session.user?.name || session.user?.email?.split("@")[0] || "User"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Welcome back, {displayName}!</h1>
          <p className="mt-2 text-black/80">Manage your videos and photos from your personal dashboard.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/40 overflow-hidden shadow-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">🎥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black/70 truncate">Total Videos</dt>
                    <dd className="text-lg font-medium text-black">{stats.videoCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white/50 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/videos" className="font-medium text-blue-600 hover:text-blue-800">
                  View all videos →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/40 overflow-hidden shadow-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">📸</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black/70 truncate">Total Photos</dt>
                    <dd className="text-lg font-medium text-black">{stats.photoCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white/50 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/photos" className="font-medium text-green-600 hover:text-green-800">
                  View all photos →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/40 overflow-hidden shadow-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg">💾</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black/70 truncate">Storage Usage</dt>
                    <dd className="text-lg font-medium text-black">{formatFileSize(stats.totalSize)}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white/50 px-5 py-3">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-black/70">Storage used</span>
                  <span className="text-black/70">{formatFileSize(stats.maxStorage)}</span>
                </div>
                {/* Circular Progress Indicator */}
                <div className="flex justify-center">
                  <div className="relative w-16 h-16">
                    {/* Background circle */}
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-300"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Progress circle */}
                      <path
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min((stats.totalSize / stats.maxStorage) * 100, 100) * 1.01} 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    {/* Percentage text in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-black">
                        {Math.round((stats.totalSize / stats.maxStorage) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-black/60 text-center mt-2">
                  {formatFileSize(stats.totalSize)} of {formatFileSize(stats.maxStorage)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/40 p-6 mb-8 shadow-lg">
          <h2 className="text-lg font-medium text-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/upload"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">⬆️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-black">Upload New Content</h3>
                <p className="text-sm text-black/70">Upload videos and photos to your library</p>
              </div>
            </Link>

            <Link
              href="/dashboard/videos"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">🎥</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-black">Manage Videos</h3>
                <p className="text-sm text-black/70">View, organize, and delete your videos</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/40 p-6 shadow-lg">
          <h2 className="text-lg font-medium text-black mb-4">Recent Activity</h2>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-black/70">
              <p>No recent activity to display</p>
              <p className="text-sm mt-2">Start by uploading some content!</p>
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((item) => (
                <li key={`${item.type}-${item._id}`} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.type === 'video' ? '🎬' : '📸'}</span>
                    <div>
                      <div className="text-sm text-black">
                        <span className="font-medium">{displayName}</span> uploaded a {item.type} — {item.title}
                      </div>
                      <div className="text-xs text-black/60">{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <Link href={item.type === 'video' ? '/dashboard/videos' : '/dashboard/photos'} className="text-sm text-blue-600 hover:underline">View</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
