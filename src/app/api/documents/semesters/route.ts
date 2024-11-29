import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function POST(req: Request) {
    const userId = req.headers.get("user-id"); // Extract user ID from headers
    const { name } = await req.json();

    if (!userId || !name) {
        return NextResponse.json({ error: "Missing userId or semester name" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("documents");
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
        { _id: userId },
        { $push: { semesters: { _id: new ObjectId(), name, subjects: [] } } },
        { upsert: true }
    );

    return NextResponse.json({ message: "Semester created" });
}

export async function GET(req: Request) {
    const userId = req.headers.get("user-id");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("documents");
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.semesters || []);
}