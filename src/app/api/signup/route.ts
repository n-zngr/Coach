import { NextResponse } from "next/server";
import { MongoClient, Db, Collection } from "mongodb";
import bcrypt from "bcrypt"

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI as string; // Ensure this is defined in your .env file
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

// Declare the MongoClient variable with a proper type
let client: MongoClient | null = null;

// Function to connect to the MongoDB database
async function connectToDatabase(): Promise<Collection> {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  const db: Db = client.db(DATABASE_NAME);
  return db.collection(COLLECTION_NAME);
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // Parse the incoming JSON

    // Destructure fields from the request body
    const { fullname, email, password, confirmPassword } = body;

    // Check for missing fields
    if (!fullname || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "Fullname, E-mail, password, and confirm password are required" },
        { status: 400 }
      );
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Connect to the MongoDB database and get the collection
    const collection = await connectToDatabase();

    // Check if the email already exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await collection.insertOne({
      fullname,
      email,
      hashedPassword, // Store the hashed password
    });

    return NextResponse.json({
      message: "User registered successfully",
      result,
    });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { message: "Failed to register user", error },
      { status: 500 }
    );
  }
}