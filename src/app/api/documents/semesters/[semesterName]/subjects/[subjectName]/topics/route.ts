import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function POST(req: Request, { params }: { params: { semesterName: string; subjectName: string } }) {
    const userId = req.headers.get("user-id");
    const { name, description } = await req.json();

    if (!userId || !name || !params.semesterName || !params.subjectName) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("documents");
    await db.collection("users").updateOne(
        {
            _id: userId,
            "semesters.name": params.semesterName,
            "semesters.subjects.name": params.subjectName,
        },
        { $push: { "semesters.$.subjects.$.topics": { _id: new ObjectId(), name, description } } }
    );

    return NextResponse.json({ message: "Topic created" });
}