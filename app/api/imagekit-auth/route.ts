// File: app/api/imagekit-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {
    try {
        // Check if required environment variables are set
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
        const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY
        
        if (!privateKey) {
            console.error("IMAGEKIT_PRIVATE_KEY is not set")
            return Response.json({ 
                error: "ImageKit private key is not configured",
                details: "Please check your environment variables"
            }, { status: 500 })
        }
        
        if (!publicKey) {
            console.error("NEXT_PUBLIC_PUBLIC_KEY is not set")
            return Response.json({ 
                error: "ImageKit public key is not configured",
                details: "Please check your environment variables"
            }, { status: 500 })
        }
        
        console.log("ImageKit keys found, generating auth params...")
        
        const authenticationParameters = getUploadAuthParams({
            privateKey,
            publicKey,
        })
        
        console.log("Auth params generated successfully")
        
        // Include public key in response for ImageKit v2 upload
        return Response.json({
            ...authenticationParameters,
            publicKey
        })
    } catch (error) {
        console.error("ImageKit authentication error:", error)
        return Response.json({ 
            error: "Authentication for ImageKit failed",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}