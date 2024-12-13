import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI! as string;

export async function GET(req: Request) {
    const client = new MongoClient(MONGODB_URI);

    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }

        const semesterId = req.headers.get('semesterId');
        const subjectId = req.headers.get('subjectId');
        const topicId = req.headers.get('topicId');

        await client.connect();
        const db = client.db('documents');
        const filesCollection = db.collection('fs.files');

        const query: any = { 'metadata.userId': userId };

        if (semesterId) query['metadata.semesterId'] = semesterId;
        if (subjectId) query['metadata.subjectId'] = subjectId;
        if (topicId) query['metadata.topicId'] = topicId;

        const files = await filesCollection.find(query).toArray();

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ message: 'Failed to fetch files', error }, { status: 500 });
    } finally {
        await client.close();
    }
}
