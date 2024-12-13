import { NextResponse } from "next/server";
import { MongoClient, Db, Collection } from "mongodb";
import { hashPassword } from "@/app/utils/passwordHash";

const MONGODB_URI = process.env.MONGODB_URI! as string; // Ensure this is defined in your .env file
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

let client: MongoClient | null = null;

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
    const { email, password} = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }
    const collection = await connectToDatabase();

    const user = await collection.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Use your custom password hashing utility
    const hashedPassword = await hashPassword(password);

    // Update user's password and clear the reset token
    await collection.updateOne(
      { email },
      { $set: { password: hashedPassword }}
    );

    return NextResponse.json({ message: "Password reset successful!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred while resetting the password." },
      { status: 500 }
    );
  }
}
