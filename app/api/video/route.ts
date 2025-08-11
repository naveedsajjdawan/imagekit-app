import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        await connectToDatabase()
        const videos = await Video.find({ userId: session.user?.email }).sort({createdAt: -1}).lean()

        if(!videos || videos.length < 1)
        {
            return NextResponse.json(
                { videos: [] },
                {status: 200}
            )
        }
        return NextResponse.json(
            { videos },
            {status: 200}
        )

    } catch (error) {
        console.error(error)
         return NextResponse.json(
            {error:"Failed to fetch videos"},
            {status: 500}
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if(!session)
        {
            return NextResponse.json(
                {error:"Unauthorized"},
                {status: 401}
            )
        }
        
        await connectToDatabase()
        const body = await request.json()
        console.log("/api/video POST body:", body)
        
        const resolvedTitle = body.title || body.name || "Untitled Video"
        const resolvedUrl = body.videoUrl || body.url
        const resolvedThumb = body.thumbnailUrl || body.thumbnail || ""
        
        if(!resolvedTitle || !resolvedUrl) {
           return NextResponse.json(
                {error:"Title and video URL are required", details: { resolvedTitle, hasUrl: !!resolvedUrl }},
                {status: 400}
            )
        }
        
        const videoData = {
            title: resolvedTitle,
            description: body.description || "",
            videoUrl: resolvedUrl,
            thumbnailUrl: resolvedThumb,
            size: body.size || 0,
            duration: body.duration || 0,
            userId: body.userId || session.user?.email || "",
            controls: body.controls ?? true,
            transformations:{
                height: body?.transformations?.height ?? 1920,
                width: body?.transformations?.width ?? 1080,
                quality: body?.transformations?.quality ?? 100,
            }
        }
        
        try {
            const newVideo = await Video.create(videoData)
            return NextResponse.json(
                { message: "Video created successfully", video: newVideo },
                {status: 201}
            )
        } catch (err: any) {
            console.error("Video.create failed:", err?.message || err)
            return NextResponse.json(
                {error:"Validation failed", details: err?.message || String(err)},
                {status: 400}
            )
        }
    } catch (error) {
     console.error("/api/video POST error:", error)   
     return NextResponse.json(
            {error:"Failed to create video"},
            {status: 500}
        )
    }
}