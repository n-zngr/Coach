import { NextResponse } from "next/server";
import { MongoClient, Db, Collection, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

export async function POST(req: Request) {
  const { userId, newPassword } = await req.json(); // Parsing the incoming JSON request body

  if (!userId || !newPassword) {
    return NextResponse.json(
      { message: "User ID and new password are required" },
      { status: 400 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const database: Db = client.db(DATABASE_NAME);
    const usersCollection: Collection = database.collection(COLLECTION_NAME);

    // Attempt to update the user's password
    await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { hashedpassword: newPassword } }
    );
    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

