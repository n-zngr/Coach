import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function POST(req: Request, { params }: { params: { semesterName: string } }) {
    const userId = req.headers.get("user-id");
    const { name } = await req.json();

    if (!userId || !name || !params.semesterName) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("documents");
    await db.collection("users").updateOne(
        { _id: userId, "semesters.name": params.semesterName },
        { $push: { "semesters.$.subjects": { _id: new ObjectId(), name, topics: [] } } }
    );

    return NextResponse.json({ message: "Subject created" });
}