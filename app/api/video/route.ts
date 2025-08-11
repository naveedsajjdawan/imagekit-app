import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDatabase()
        const videos = await Video.find().sort({createdAt: -1}).lean()

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
        
        // Support both old and new video formats
        if(!body.title || !body.videoUrl) {
           return NextResponse.json(
                {error:"Title and video URL are required"},
                {status: 400}
            )
        }
        
        const videoData = {
            title: body.title,
            description: body.description || "",
            videoUrl: body.videoUrl || body.url,
            thumbnailUrl: body.thumbnailUrl || body.thumbnail || "",
            size: body.size || 0,
            duration: body.duration || 0,
            userId: body.userId || session.user?.email,
            controls: body.controls ?? true,
            transformations:{
                height: body?.transformations?.height ?? 1920,
                width: body?.transformations?.width ?? 1080,
                quality: body?.transformations?.quality ?? 100,
            }
        }
        
        const newVideo = await Video.create(videoData)
        return NextResponse.json(
            { message: "Video created successfully", video: newVideo },
            {status: 201}
        )
    } catch (error) {
     console.error(error)   
     return NextResponse.json(
            {error:"Failed to create video"},
            {status: 500}
        )
    }
}