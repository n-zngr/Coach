import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

export async function GET(req: Request) {
    const client = new MongoClient(uri);

    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get("userId");
        const semesterId = url.searchParams.get("semesterId");
        const subjectId = url.searchParams.get("subjectId");
        const topicId = url.searchParams.get("topicId");

        await client.connect();
        const db = client.db("documents");
        const filesCollection = db.collection("fs.files");

        const query: any = {};
        if (userId) query["metadata.userId"] = userId;
        if (semesterId) query["metadata.semesterId"] = semesterId;
        if (subjectId) query["metadata.subjectId"] = subjectId;
        if (topicId) query["metadata.topicId"] = topicId;

        const files = await filesCollection.find(query).toArray();

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ message: "Failed to fetch files", error }, { status: 500 });
    } finally {
        await client.close();
    }
}
