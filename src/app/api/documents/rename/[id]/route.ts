import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const client = new MongoClient(MONGODB_URI);

    try {
        const { id } = await params;
        const fileId = id;
        const { newFilename } = await req.json();

        if (!newFilename) {
            return NextResponse.json({ message: 'New filename is required' }, { status: 400 });
        }

        await client.connect();
        const db = client.db('documents');
        const filesCollection = db.collection('fs.files');

        const result = await filesCollection.updateOne(
            { _id: new ObjectId(fileId) },
            { $set: { filename: newFilename } }
        );

        if (result.modifiedCount === 0) {
            throw new Error('File not found or update failed');
        }

        return NextResponse.json({ message: 'File renamed successfully' });
    } catch (error) {
        console.error('Error renaming file:', error);
        return NextResponse.json({ message: 'Failed to rename file', error }, { status: 500 });
    } finally {
        await client.close();
    }
}