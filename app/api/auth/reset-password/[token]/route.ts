import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 })

  await connectToDatabase()
  const user = await User.findOne({ resetPasswordToken: params.token, resetPasswordExpires: { $gt: new Date() } })
  if (!user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  user.password = hashed
  user.resetPasswordToken = null
  user.resetPasswordExpires = null
  user.passwordRequiresReset = false
  await user.save()

  return NextResponse.json({ ok: true })
}
