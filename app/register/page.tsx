"use client"
import { useRouter } from "next/navigation";
import React,{useMemo, useState} from "react";

const Page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [showConfirmRules, setShowConfirmRules] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
    const router = useRouter()

    const rules = useMemo(() => ({
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        length: password.length >= 8,
    }), [password])
    const allValid = Object.values(rules).every(Boolean)

    const validatePassword = (pwd: string) => {
        return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({})
        if(!email || !password || !confirmPassword) {
            setErrors({ email: "All fields are required" })
            return
        }
        if(password !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" })
            return
        }
        if(!validatePassword(password)) {
            setErrors({ 
                password: "Password must contain 1 capital letter, 1 small letter, 1 special character, 1 number and be 8+ characters" 
            })
            return
        }
        try {
            setIsLoading(true);
            const res = await fetch("/api/auth/register",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({email, password})
            })
            const data = await res.json()
            if(!res.ok) throw new Error(data?.error || "Registration failed")
            router.push("/login")
        } catch (error) {
            console.error('Registration error:', error)
            setErrors({ email: error instanceof Error ? error.message : 'Registration failed' })
        } finally {
            setIsLoading(false);
        }
    }

    const passwordClasses = `w-full px-4 py-2 pr-12 rounded-lg bg-white/80 text-black placeholder-black/60 border transition focus:outline-none ${password.length>0 ? (allValid ? 'border-green-500 focus:ring-2 focus:ring-green-500' : 'border-red-400 focus:ring-2 focus:ring-red-500') : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`
    const confirmClasses = `w-full px-4 py-2 pr-12 rounded-lg bg-white/80 text-black placeholder-black/60 border transition focus:outline-none ${confirmPassword.length>0 ? (confirmPassword===password && allValid ? 'border-green-500 focus:ring-2 focus:ring-green-500' : 'border-red-400 focus:ring-2 focus:ring-red-500') : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`

    return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-gray-300 to-gray-100">
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/40">
            <h1 className="text-3xl font-extrabold text-center text-black mb-6 drop-shadow-lg">
             Create Your Account
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                     type="email"
                     placeholder="Enter your email"
                     className="w-full px-4 py-2 rounded-lg bg-white/80 text-black placeholder-black/60 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (<p className="text-red-600 text-sm mt-1">{errors.email}</p>)}
                </div>
                
                <div className="relative">
                    <input
                     onFocus={() => setShowRules(true)}
                     onBlur={() => setTimeout(() => setShowRules(false), 120)}
                     type={showPassword ? "text" : "password"}
                     placeholder="Enter your password"
                     className={passwordClasses}
                     onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 hover:text-black/80"
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>

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
                                        <span className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border ${rule.valid ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 text-gray-500'}`}>
                                            {rule.valid ? '✓' : '•'}
                                        </span>
                                        <span>{rule.label}</span>
                                    </li>
                                ))}
                            </ul>
                            {allValid && (
                                <div className="mt-2 text-[11px] font-medium text-green-700">Strong password ✓</div>
                            )}
                        </div>
                    )}
                    {errors.password && (<p className="text-red-600 text-sm mt-1">{errors.password}</p>)}
                </div>
                
                <div className="relative">
                    <input
                     onFocus={() => setShowConfirmRules(true)}
                     onBlur={() => setTimeout(() => setShowConfirmRules(false), 120)}
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder="Confirm your password"
                     className={confirmClasses}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 hover:text-black/80"
                    >
                        {showConfirmPassword ? "🙈" : "👁️"}
                    </button>

                    {(showConfirmRules || confirmPassword.length>0) && (
                        <div className="absolute z-10 top-full right-0 mt-2 w-72 rounded-lg border border-gray-300 bg-white shadow-lg p-3">
                            <div className="text-xs font-semibold text-black mb-2">Confirm password:</div>
                            <ul className="space-y-1 text-xs">
                                <li className={`flex items-center ${confirmPassword===password ? 'text-green-600' : 'text-gray-600'}`}>
                                    <span className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border ${confirmPassword===password ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 text-gray-500'}`}> {confirmPassword===password ? '✓' : '•'} </span>
                                    <span>Should match the password</span>
                                </li>
                            </ul>
                        </div>
                    )}
                    {errors.confirmPassword && (<p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>)}
                </div>
                
                <button
                 type="submit"
                 disabled={isLoading}
                 className={`w-full ${allValid && password===confirmPassword ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:bg-purple-400 text-white font-semibold py-2 rounded-lg shadow-lg transition transform hover:scale-105 disabled:cursor-not-allowed`}
                >
                 {isLoading ? "Registering..." : "Register"}
                </button>
            </form>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Password Requirements:</strong><br/>
                    • 1 capital letter (A-Z)<br/>
                    • 1 small letter (a-z)<br/>
                    • 1 special character (!@#$%^&*)<br/>
                    • 1 number (0-9)<br/>
                    • Minimum 8 characters
                </p>
            </div>

            <p className="text-center text-black/80 mt-4">
             Already have an account?{" "}
                <a href="/login" className="text-purple-600 hover:underline font-semibold">
                 Login
                </a>
            </p>
        </div>
    </div>
  )
    
}

export default Page

