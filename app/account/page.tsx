"use client"

import React, { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { upload } from "@imagekit/next"

const AccountPage = () => {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    const res = await fetch('/api/account')
    if (!res.ok) return
    const data = await res.json()
    setName(data.name || "")
    setAvatarUrl(data.avatarUrl || "")
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatarUrl })
    })
    if (res.ok) {
      setMessage('Profile updated successfully')
      await update() // refresh session data
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setMessage(data?.error || 'Update failed')
    }
    setSaving(false)
  }

  const pickFile = () => fileInputRef.current?.click()
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const authRes = await fetch('/api/imagekit-auth')
      if (!authRes.ok) throw new Error('Upload auth failed')
      const auth = await authRes.json()
      const res = await upload({ file, fileName: `avatar-${Date.now()}-${file.name}`, folder: '/avatars', ...auth })
      setAvatarUrl(res.url)
      setMessage('Avatar uploaded. Don\'t forget to save!')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Avatar upload failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-black mb-6">Account Settings</h1>

        <form onSubmit={handleSave} className="bg-white/90 border border-white/40 rounded-2xl shadow-lg p-6 space-y-5">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="space-x-2">
              <button type="button" onClick={pickFile} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">Upload image</button>
              <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Display Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-black/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Your name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Avatar URL (optional)</label>
            <input value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-black/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://..." />
          </div>

          {message && <div className="text-sm text-center text-black">{message}</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-60">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountPage
