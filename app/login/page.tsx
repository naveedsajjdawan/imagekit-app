'use client'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { FcGoogle } from "react-icons/fc"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      console.log(res.error)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/40">
            <h1 className="text-4xl font-extrabold text-center text-white mb-2 drop-shadow-lg">
             Welcome Back
            </h1>
        
            <p className="text-center text-white/80 mb-6">
             Sign in to continue to your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <input
                 type="email"
                 placeholder="Email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                />
                <input
                 type="password"
                 value={password}
                 placeholder="Password"
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                />
                <button
                 type="submit"
                 className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition transform hover:scale-105"
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
                 className="text-sm text-white/80 hover:text-white transition"
                >
                 Forgot your password?
                </a>
            </div>

            <p className="text-center text-white/80 mt-4">
             Don’t have an account?{" "}
                <a
                 href="/register"
                 className="text-purple-200 hover:underline font-semibold"
                >
                  Register
                </a>
            </p>
        </div>
    </div>
  )
}

export default Login
