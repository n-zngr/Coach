import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

let client: MongoClient | null = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
    }
    return client.db(DATABASE_NAME).collection(COLLECTION_NAME);
}

export async function GET(request: Request) {
    const userId = request.headers.get("user-id");
    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        const collection = await connectToDatabase();
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.semesters || []);
    } catch (error) {
        console.error("Error fetching semesters:", error);
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = request.headers.get("user-id");
    const { name } = await request.json();

    if (!userId || !name) {
        return NextResponse.json(
            { message: "User ID and semester name are required" },
            { status: 400 }
        );
    }

    try {
        const collection = await connectToDatabase();

        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { semesters: { _id: new ObjectId(), name } } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Semester added successfully" });
    } catch (error) {
        console.error("Error adding semester:", error);
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
    }
}