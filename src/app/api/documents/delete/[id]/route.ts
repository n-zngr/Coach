import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI! as string;

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const client = new MongoClient(MONGODB_URI);

    try {
        const { id } = await params;

        await client.connect();
        const db = client.db('documents');
        const bucket = db.collection('fs.files');

        const deleteFile = await bucket.deleteOne({ _id: new ObjectId(id) });

        if (!deleteFile.deletedCount) {
            throw new Error('File not found or already deleted');
        }

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ message: 'Failed to delete file', error }, { status: 500 });
    } finally {
        await client.close();
    }
}