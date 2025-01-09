import { NextResponse } from 'next/server';
import { MongoClient, GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

const MONGODB_URI = process.env.MONGODB_URI! as string;

export async function POST(req: Request) {
    const client = new MongoClient(MONGODB_URI);

    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ message: 'UserId is required'}, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const fileName = file?.name;

        const semesterIds = formData.getAll('semesterIds') as string[];
        const subjectIds = formData.getAll('subjectIds') as string[];
        const topicIds = formData.getAll('topicIds') as string[];

        if (!file || !fileName || semesterIds.length === 0 || subjectIds.length === 0 || topicIds.length === 0) {
            return NextResponse.json({ message: 'Missing required data for file upload' }, { status: 400 });
        }

        const fileBuffer = await file.arrayBuffer();
        const fileStream = Readable.from(Buffer.from(fileBuffer));

        await client.connect();
        const db = client.db('documents');
        const bucket = new GridFSBucket(db);

        const uploadStream = bucket.openUploadStream(fileName, {
            metadata: {
                userId: userId,
                semesterIds: semesterIds,
                subjectIds: subjectIds,
                topicIds: topicIds
            }
        });

        fileStream.pipe(uploadStream);

        await new Promise((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
        });

        return NextResponse.json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error during file upload:', error);
        return NextResponse.json({ message: 'Failed to upload file', error }, { status: 500 });
    } finally {
        await client.close();
    }
}