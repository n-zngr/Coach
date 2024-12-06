import { NextResponse } from "next/server";
import { MongoClient, Db, Collection } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

export async function POST(req: Request) {
  const { email } = await req.json(); // Parsing the incoming JSON request body

  if (!email) {
    return NextResponse.json(
      { message: "Email is required" },
      { status: 400 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const database: Db = client.db(DATABASE_NAME);
    const usersCollection: Collection = database.collection(COLLECTION_NAME);

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Email not registered" },
        { status: 404 }
      );
    }

    // Return the user's ObjectId (MongoDB automatically creates the _id field)
    return NextResponse.json({ objectId: user._id.toString() }); // Convert ObjectId to string before sending it
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
