import { NextResponse } from "next/server";
import { MongoClient, Db, Collection } from "mongodb";
import { verifyPassword } from "@/app/utils/passwordHash";

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI as string; // Ensure this is defined in your .env file
const DATABASE_NAME = "users"; // Replace with your actual database name
const COLLECTION_NAME = "users"; // Replace with the collection name storing users

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
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 }
    );
  }

  // Connect to the database
  const collection = await connectToDatabase();

  // Fetch the user from the database by username
  const user = await collection.findOne({ email });
  console.log(user)

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  // Compare the provided password with the hashed password
  const isMatch = await verifyPassword(password, user.hashedPassword);

  if (!isMatch) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  } else {
    return NextResponse.json({ message: "Login successful!" });
  }
}
