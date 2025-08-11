import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email }).lean()
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json({
    email: user.email,
    name: user.name || "",
    avatarUrl: user.avatarUrl || "",
  })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { name, avatarUrl } = await req.json()
  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (typeof name === 'string') user.name = name.trim()
  if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl.trim()
  await user.save()
  return NextResponse.json({ ok: true, name: user.name || "", avatarUrl: user.avatarUrl || "" })
}
