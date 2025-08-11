import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Photo from "@/models/photo";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();
        
        const photo = await Photo.findById(params.id);
        
        if (!photo) {
            return NextResponse.json(
                { error: "Photo not found" },
                { status: 404 }
            );
        }

        // Check if the user owns this photo
        if (photo.userId !== session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized to delete this photo" },
                { status: 403 }
            );
        }

        await Photo.findByIdAndDelete(params.id);
        
        return NextResponse.json(
            { message: "Photo deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting photo:", error);
        return NextResponse.json(
            { error: "Failed to delete photo" },
            { status: 500 }
        );
    }
}
