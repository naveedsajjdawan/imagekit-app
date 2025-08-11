import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Photo from "@/models/photo";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();
        
        const photos = await Photo.find({ userId: session.user?.email })
            .sort({ createdAt: -1 })
            .lean();

        if (photos.length === 0) {
            return NextResponse.json(
                { photos: [] },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { photos },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching photos:", error);
        return NextResponse.json(
            { error: "Failed to fetch photos" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();
        
        const body = await request.json();
        
        if (!body.title || !body.imageUrl) {
            return NextResponse.json(
                { error: "Title and image URL are required" },
                { status: 400 }
            );
        }

        const photoData = {
            title: body.title,
            description: body.description || "",
            imageUrl: body.imageUrl,
            thumbnailUrl: body.thumbnailUrl || body.imageUrl,
            size: body.size || 0,
            width: body.width,
            height: body.height,
            userId: session.user?.email,
            tags: body.tags || []
        };

        const newPhoto = await Photo.create(photoData);
        
        return NextResponse.json(
            { message: "Photo created successfully", photo: newPhoto },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating photo:", error);
        return NextResponse.json(
            { error: "Failed to create photo" },
            { status: 500 }
        );
    }
}
