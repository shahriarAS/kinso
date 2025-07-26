import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kinso-inventory";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null }; // eslint-disable-line

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("Mongoose connected successfully");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("Mongoose connection error:", error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // Ensure connection is ready
    if (cached.conn.connection.readyState !== 1) {
      throw new Error("Mongoose connection not ready");
    }
    
    console.log("Database connection established");
  } catch (e) {
    cached.promise = null;
    console.error("Database connection failed:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
