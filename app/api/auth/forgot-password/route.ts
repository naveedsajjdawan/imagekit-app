import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  await connectToDatabase()
  const user = await User.findOne({ email })
  if (!user) {
    // Do not reveal user existence
    return NextResponse.json({ ok: true })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 15) // 15 minutes

  user.resetPasswordToken = token
  user.resetPasswordExpires = expires
  await user.save()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password/${token}`

  // TODO: send email - for now, log to server
  console.log('Password reset link for', email, ':', resetUrl)

  return NextResponse.json({ ok: true })
}
