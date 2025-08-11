import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== Simple Test API Called ===");
    console.log("Environment check:", {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoURI: !!process.env.MONGODB_URI,
      mongoURILength: process.env.MONGODB_URI?.length || 0
    });
    
    return NextResponse.json(
      { 
        message: "Simple API test successful!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Simple test failed:", error);
    return NextResponse.json(
      { error: "Simple test failed" },
      { status: 500 }
    );
  }
}
