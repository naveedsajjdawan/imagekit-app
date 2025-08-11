import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai-app"

if(!process.env.MONGODB_URI)
{
    console.warn("⚠️  MONGODB_URI not found in environment variables!")
    console.warn("📝 Create a .env.local file with:")
    console.warn("   MONGODB_URI=mongodb://127.0.0.1:27017/ai-app")
    console.warn("🔗 Using fallback connection:", MONGODB_URI)
}

let cached = global.mongoose

if(!cached)
{
 cached = global.mongoose = {conn: null, promise: null }
}

export async function connectToDatabase() {
    console.log("Attempting to connect to MongoDB...");
    
    if(cached.conn)
    {
        console.log("Using cached database connection");
        return cached.conn
    }

    if(!cached.promise)
    {
        console.log("Creating new database connection...");
        const opts =
        {
            bufferCommands: true,
        }
        cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then(()=> {
            console.log("MongoDB connected successfully");
            return mongoose.connection;
        })
        .catch((error) => {
            console.error("MongoDB connection failed:", error);
            throw error;
        });
    }
    try {
        cached.conn = await cached.promise
        console.log("Database connection established");
    } catch (error) {
        console.error("Database connection error:", error);
        cached.promise = null
        throw error
    }
    return cached.conn
}