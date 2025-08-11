import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const videoId = params.id

    // Find the video and check ownership
    const video = await Video.findById(videoId)
    
    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      )
    }

    // Check if user owns this video (optional security check)
    if (video.userId && video.userId !== session.user?.email) {
      return NextResponse.json(
        { error: "You can only delete your own videos" },
        { status: 403 }
      )
    }

    // Delete the video
    await Video.findByIdAndDelete(videoId)

    return NextResponse.json(
      { message: "Video deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    )
  }
}
