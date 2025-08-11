"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const Navigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [avatarOverride, setAvatarOverride] = useState<string>("")

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    const maybeFetch = async () => {
      if (!session?.user?.email) return
      if (session.user.image) return
      try {
        const res = await fetch('/api/account')
        if (!res.ok) return
        const data = await res.json()
        if (data?.avatarUrl) setAvatarOverride(data.avatarUrl)
      } catch {}
    }
    maybeFetch()
  }, [session?.user?.email, session?.user?.image])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/dashboard/videos", label: "Videos", icon: "🎥" },
    { href: "/dashboard/photos", label: "Photos", icon: "📸" },
    { href: "/dashboard/upload", label: "Upload", icon: "⬆️" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "User"
  const avatar = avatarOverride || session?.user?.image || ""

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/phovihub-logo.png" alt="Phovihub" className="h-7 w-7 object-contain" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
              <span className="text-xl font-bold text-gray-900">Phovihub</span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4" ref={menuRef}>
            {session?.user && (
              <div className="relative">
                <button onClick={()=>setOpen(v=>!v)} className="flex items-center space-x-3">
                  <div className="text-sm text-gray-700 hidden sm:block">
                    Welcome, <span className="font-medium">{displayName}</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">Signed in as <strong>{displayName}</strong></div>
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Account settings</Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
