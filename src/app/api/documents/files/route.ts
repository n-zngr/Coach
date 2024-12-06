import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

export async function GET(req: Request) {
    const client = new MongoClient(uri);

    try {
        const url = new URL(req.url);
        const topicId = url.searchParams.get('topicId');

        if (!topicId) {
            return NextResponse.json({ message: 'TopicId is required '}, { status: 400 });
        }

        await client.connect();
        const db = client.db("documents");
        const filesCollection = db.collection('fs.files');

        const files = await filesCollection.find({ "metadata.topicId": topicId }).toArray();

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch files", error }, { status: 500 });
    } finally {
        await client.close();
    }
}