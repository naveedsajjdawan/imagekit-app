import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"
import bcrypt from "bcrypt"

const meetsPolicy = (pwd: string) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*(),.?":{}|<>]/.test(pwd) && pwd.length >= 8

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { password } = await req.json()
  if (!password || !meetsPolicy(password)) {
    return NextResponse.json({ error: "Password does not meet policy" }, { status: 400 })
  }

  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const hashed = await bcrypt.hash(password, 10)
  user.password = hashed
  user.passwordRequiresReset = false
  await user.save()

  return NextResponse.json({ ok: true })
}
