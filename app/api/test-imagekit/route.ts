export async function GET() {
    try {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
        const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY
        const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT
        
        return Response.json({
            hasPrivateKey: !!privateKey,
            hasPublicKey: !!publicKey,
            hasUrlEndpoint: !!urlEndpoint,
            privateKeyLength: privateKey ? privateKey.length : 0,
            publicKeyLength: publicKey ? publicKey.length : 0,
            urlEndpoint: urlEndpoint || 'Not set',
            env: process.env.NODE_ENV
        })
    } catch (error) {
        return Response.json({
            error: "Failed to check ImageKit configuration",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}
