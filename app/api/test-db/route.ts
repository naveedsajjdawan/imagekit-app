import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    console.log("=== Testing Database Connection ===");
    console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);
    console.log("MongoDB URI length:", process.env.MONGODB_URI?.length || 0);
    
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MONGODB_URI environment variable is not set" },
        { status: 500 }
      );
    }

    console.log("Attempting to connect to MongoDB...");
    const connection = await connectToDatabase();
    console.log("Connection object:", !!connection);
    
    // Test if we can actually perform operations
    if (!connection.db) {
      throw new Error("Database connection object is undefined");
    }
    
    const testCollection = connection.db.collection('test');
    const testResult = await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log("Test insert result:", testResult.insertedId);
    
    // Clean up test data
    await testCollection.deleteOne({ _id: testResult.insertedId });
    console.log("Test cleanup completed");
    
    return NextResponse.json(
      { 
        message: "Database connection and operations successful!",
        connection: "Active",
        test: "Passed"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json(
      { 
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
