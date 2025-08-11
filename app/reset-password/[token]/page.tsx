"use client"

import React, { useMemo, useRef, useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

const ResetPasswordPage = () => {
  const router = useRouter()
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showConfirmRules, setShowConfirmRules] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      const target = e.target as Node
      if (!containerRef.current.contains(target)) {
        setShowRules(false)
        setShowConfirmRules(false)
      }
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRules(false)
        setShowConfirmRules(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const rules = useMemo(() => ({
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8,
  }), [password])
  const allValid = Object.values(rules).every(Boolean)

  const passwordClasses = `w-full px-4 py-3 pr-12 rounded-lg bg-white/80 text-black placeholder-black/60 border transition focus:outline-none ${password.length>0 ? (allValid ? 'border-green-500 focus:ring-2 focus:ring-green-500' : 'border-red-400 focus:ring-2 focus:ring-red-500') : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`
  const confirmClasses = `w-full px-4 py-3 pr-12 rounded-lg bg-white/80 text-black placeholder-black/60 border transition focus:outline-none ${confirmPassword.length>0 ? (confirmPassword===password && allValid ? 'border-green-500 focus:ring-2 focus:ring-green-500' : 'border-red-400 focus:ring-2 focus:ring-red-500') : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")
    setIsSuccess(false)
    setShowRules(false)
    setShowConfirmRules(false)
    if (!allValid || password !== confirmPassword) {
      setMessage("Please meet all requirements and ensure both fields match.")
      return
    }
    const res = await fetch(`/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (res.ok) {
      setIsSuccess(true)
      setMessage("Password changed successfully. Redirecting to login...")
      setTimeout(()=> router.push('/login'), 1200)
    } else {
      setIsSuccess(false)
      setMessage(data?.error || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100 px-4">
      <div ref={containerRef} className="bg-white/90 rounded-2xl shadow-2xl border border-white/40 w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-black mb-2">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input onFocus={()=>setShowRules(true)} onBlur={()=>setTimeout(()=>setShowRules(false),120)} type={showPassword? 'text':'password'} placeholder="New password" value={password} onChange={(e)=>setPassword(e.target.value)} className={passwordClasses}/>
            <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black/80">{showPassword? '🙈':'👁️'}</button>
            {(showRules || password.length>0) && (
              <div className="absolute z-10 top-full right-0 mt-2 w-72 rounded-lg border border-gray-300 bg-white shadow-lg p-3">
                <div className="text-xs font-semibold text-black mb-2">Password must include:</div>
                <ul className="space-y-1 text-xs">
                  {[
                    { key: 'uppercase', label: '1 uppercase (A-Z)', valid: rules.uppercase },
                    { key: 'lowercase', label: '1 lowercase (a-z)', valid: rules.lowercase },
                    { key: 'number', label: '1 number (0-9)', valid: rules.number },
                    { key: 'special', label: '1 special (!@#$%^&*)', valid: rules.special },
                    { key: 'length', label: '8+ characters', valid: rules.length },
                  ].map(rule => (
                    <li key={rule.key} className={`flex items-center ${rule.valid ? 'text-green-600' : 'text-gray-600'}`}>
                      <span className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border ${rule.valid ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 text-gray-500'}`}>{rule.valid? '✓':'•'}</span>
                      <span>{rule.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <input onFocus={()=>setShowConfirmRules(true)} onBlur={()=>setTimeout(()=>setShowConfirmRules(false),120)} type={showConfirmPassword? 'text':'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className={confirmClasses}/>
            <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black/80">{showConfirmPassword? '🙈':'👁️'}</button>
            {(showConfirmRules || confirmPassword.length>0) && (
              <div className="absolute z-10 top-full right-0 mt-2 w-72 rounded-lg border border-gray-300 bg-white shadow-lg p-3">
                <div className="text-xs font-semibold text-black mb-2">Confirm password:</div>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center ${confirmPassword===password ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border ${confirmPassword===password ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 text-gray-500'}`}>{confirmPassword===password? '✓':'•'}</span>
                    <span>Should match the password</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {message && (
            <div className={`text-sm mt-2 text-center ${isSuccess ? 'text-green-700' : 'text-red-600'}`}>{message}</div>
          )}

          <button type="submit" className={`w-full ${allValid && password===confirmPassword ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold py-2 rounded-lg shadow-lg transition`}>Reset Password</button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
