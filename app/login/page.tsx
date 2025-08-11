'use client'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import { FcGoogle } from "react-icons/fc"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const router = useRouter()

  const passwordRules = useMemo(() => ({
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8,
  }), [password])
  const allPasswordValid = Object.values(passwordRules).every(Boolean)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    // Do NOT block login for legacy users; server will flag passwordRequiresReset
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setErrors({ email: "Invalid email or password" })
    } else {
      router.push("/dashboard")
    }
  }

  const passwordInputClasses = `w-full px-4 py-3 pr-12 rounded-lg bg-white/80 text-black placeholder-black/60 border transition focus:outline-none ${password.length > 0 ? (allPasswordValid ? 'border-green-500 focus:ring-2 focus:ring-green-500' : 'border-red-400 focus:ring-2 focus:ring-red-500') : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/40">
            <h1 className="text-4xl font-extrabold text-center text-black mb-2 drop-shadow-lg">
             Welcome Back
            </h1>
        
            <p className="text-center text-black/80 mb-6">
             Sign in to continue to your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                   type="email"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-black/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="relative">
                  <input
                   onFocus={() => setShowRules(true)}
                   onBlur={() => setTimeout(() => setShowRules(false), 120)}
                   type={showPassword ? "text" : "password"}
                   value={password}
                   placeholder="Password"
                   onChange={(e) => setPassword(e.target.value)}
                   className={passwordInputClasses}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 hover:text-black/80"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>

                  {(showRules || password.length > 0) && (
                    <div className="absolute z-10 top-full right-0 mt-2 w-72 rounded-lg border border-gray-300 bg-white shadow-lg p-3">
                      <div className="text-xs font-semibold text-black mb-2">Password must include:</div>
                      <ul className="space-y-1 text-xs">
                        {[
                          { key: 'uppercase', label: '1 uppercase (A-Z)', valid: passwordRules.uppercase },
                          { key: 'lowercase', label: '1 lowercase (a-z)', valid: passwordRules.lowercase },
                          { key: 'number', label: '1 number (0-9)', valid: passwordRules.number },
                          { key: 'special', label: '1 special (!@#$%^&*)', valid: passwordRules.special },
                          { key: 'length', label: '8+ characters', valid: passwordRules.length },
                        ].map(rule => (
                          <li key={rule.key} className={`flex items-center ${rule.valid ? 'text-green-600' : 'text-gray-600'}`}>
                            <span className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border ${rule.valid ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 text-gray-500'}`}>
                              {rule.valid ? '✓' : '•'}
                            </span>
                            <span>{rule.label}</span>
                          </li>
                        ))}
                      </ul>
                      {allPasswordValid && (
                        <div className="mt-2 text-[11px] font-medium text-green-700">Strong password ✓</div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                 type="submit"
                 className={`w-full ${allPasswordValid ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold py-3 rounded-lg shadow-lg transition transform hover:scale-105`}
                >
                  Login
                </button>
            </form>
            
            <div className="flex items-center justify-between mt-6">
                <button
                 onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                 className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 transition mb-2"
                >
                 <FcGoogle className="text-xl" />
                 Sign in with Google
                </button>
            </div>
            <div className="mt-6 text-center">
                <a
                 href="/forgot-password"
                 className="text-sm text-black/80 hover:text-black transition"
                >
                 Forgot your password?
                </a>
            </div>

            <p className="text-center text-black/80 mt-4">
             Don't have an account?{" "}
                <a
                 href="/register"
                 className="text-purple-600 hover:underline font-semibold"
                >
                  Register
                </a>
            </p>
        </div>
    </div>
  )
}

export default Login
