import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI! as string;

export async function PATCH(req: Request, { params }: { params: { fileId: string } }) {
    const client = new MongoClient(MONGODB_URI);

    try {
        const { fileId } = await params;

        if (!fileId) {
            return NextResponse.json({ message: 'File ID is required' }, { status: 400 });
        }

        // Validate fileId format
        if (!ObjectId.isValid(fileId)) {
            return NextResponse.json({ message: 'Invalid file ID format' }, { status: 400 });
        }

        const body = await req.json();
        const { userId, semesterId, subjectId, topicId } = body;

        if (!userId || !semesterId || !subjectId || !topicId) {
            return NextResponse.json({ message: 'All fields (userId, semesterId, subjectId, topicId) are required' }, { status: 400 });
        }

        await client.connect();
        const db = client.db('documents');
        const filesCollection = db.collection('fs.files');

        // Ensure metadata field is updated correctly
        const updateResult = await filesCollection.updateOne(
            { _id: new ObjectId(fileId) },
            {
                $addToSet: {
                    'metadata.semesterIds': semesterId,
                    'metadata.subjectIds': subjectId,
                    'metadata.topicIds': topicId,
                },
            }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json(
                { message: 'No changes made. File metadata may already be updated.' },
                { status: 200 }
            );
        }

        return NextResponse.json({ message: 'File metadata successfully updated.' });
    } catch (error) {
        console.error('Error updating file metadata:', error);
        return NextResponse.json({ message: 'Failed to update file metadata', error }, { status: 500 });
    } finally {
        await client.close();
    }
}