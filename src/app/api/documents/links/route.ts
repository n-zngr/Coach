import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI! as string;

// POST-Route (vorhanden)
export async function POST(req: Request) {
    const client = new MongoClient(MONGODB_URI);

    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ message: 'UserId is required' }, { status: 400 });
        }

        const linkData = await req.json();
        const { name, url, metadata } = linkData;
        const { semesterId, subjectId, topicId } = metadata;

        if (!name || !url || !semesterId || !subjectId || !topicId) {
            return NextResponse.json({ message: 'Missing required data for link upload' }, { status: 400 });
        }

        await client.connect();
        const db = client.db('documents');
        const linksCollection = db.collection('links');

        await linksCollection.insertOne({
            name,
            url,
            metadata: {
                userId,
                semesterId,
                subjectId,
                topicId,
            },
        });

        return NextResponse.json({ message: 'Link uploaded successfully' });
    } catch (error) {
        console.error('Error during link upload:', error);
        return NextResponse.json({ message: 'Failed to upload link', error }, { status: 500 });
    } finally {
        await client.close();
    }
}

// GET-Route (angepasst)
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
        const linksCollection = db.collection('links');

        const query: any = { 'metadata.userId': userId };

        if (semesterId) query['metadata.semesterId'] = semesterId;
        if (subjectId) query['metadata.subjectId'] = subjectId;
        if (topicId) query['metadata.topicId'] = topicId;

        const links = await linksCollection.find(query).toArray();

        console.log(links);
        return NextResponse.json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json({ message: 'Failed to fetch links', error }, { status: 500 });
    } finally {
        await client.close();
    }
}