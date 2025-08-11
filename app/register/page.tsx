"use client"
import { useRouter } from "next/navigation";
import React,{useState} from "react";

const Page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if(!email || !password || !confirmPassword) {
            alert("All fields are required")
            return
        }
        
        if(password !== confirmPassword)
        {
            alert("Passwords do not match")
            return
        }
        
        if(password.length < 6) {
            alert("Password must be at least 6 characters long")
            return
        }
        try {
            setIsLoading(true);
            const res = await fetch("/api/auth/register",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password})
            })
            const data = await res.json()
            if(!res.ok)
            {
               throw new Error(data?.error || "Registration failed")
            }
            else
            {
                router.push("/login")
            }
                
        } catch (error) {
         console.error('Registration error:', error)
         alert(error instanceof Error ? error.message : 'Registration failed')   
        } finally {
            setIsLoading(false);
        }
    }

    return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/40">
            <h1 className="text-3xl font-extrabold text-center text-white mb-6 drop-shadow-lg">
             Create Your Account
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                 type="email"
                 placeholder="Enter your email"
                 className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300"
                 onChange={(e) => setEmail(e.target.value)}
                />
                <input
                 type="password"
                 placeholder="Enter your password"
                 className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300"
                 onChange={(e) => setPassword(e.target.value)}
                />
                <input
                 type="password"
                 placeholder="Confirm your password"
                 className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300"
                 onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2 rounded-lg shadow-lg transition transform hover:scale-105 disabled:cursor-not-allowed"
                >
                 {isLoading ? "Registering..." : "Register"}
                </button>
            </form>

            <p className="text-center text-white/80 mt-4">
             Already have an account?{" "}
                <a href="/login" className="text-purple-200 hover:underline font-semibold">
                 Login
                </a>
            </p>
        </div>
    </div>
  )
    
}

export default Page

