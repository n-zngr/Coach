import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const DATABASE_NAME = 'documents';
const COLLECTION_NAME = 'fs.files';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {

    try {
        const { id } = await params;

        const bucket = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const deleteFile = await bucket.deleteOne({ _id: new ObjectId(id) });

        if (!deleteFile.deletedCount) {
            throw new Error('File not found or already deleted');
        }

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ message: 'Failed to delete file', error }, { status: 500 });
    }
}