
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Registration API Called ===");
    console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);
    console.log("MongoDB URI value:", process.env.MONGODB_URI || "NOT SET");
    console.log("Current working directory:", process.cwd());
    console.log("Environment variables:", Object.keys(process.env).filter(key => key.includes('MONGODB')));
    
    const { email, password } = await request.json();
    console.log("Received data:", { email, password: password ? "***" : "missing" });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Attempting database connection...");
    const connection = await connectToDatabase();
    console.log("Database connection successful!", !!connection);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already registered" },
        { status: 400 }
      );
    }

    await User.create({
      email,
      password,
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    // Check if it's a MongoDB connection error
    if (error instanceof Error && error.message.includes('MongoDB')) {
      return NextResponse.json(
        { error: "Database connection failed. Please check your MongoDB URI." },
        { status: 500 }
      );
    }
    
    // Check if it's a validation error
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}