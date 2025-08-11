"use client"

import React, { useState } from "react"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (res.ok) setMessage("If this email exists, a reset link has been sent.")
    else setMessage(data?.error || "Request failed")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100 px-4">
      <div className="bg-white/90 rounded-2xl shadow-2xl border border-white/40 w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-black mb-2">Forgot Password</h1>
        <p className="text-black/80 mb-4">Enter your email, and we\'ll send you a password reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-black/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg">
            {loading? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        {message && <div className="mt-3 text-center text-black">{message}</div>}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
