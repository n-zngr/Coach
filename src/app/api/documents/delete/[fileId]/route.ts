import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const DATABASE_NAME = 'documents';
const COLLECTION_NAME = 'fs.files';

export async function DELETE(_request: Request, { params }: { params: { fileId: string } } ) {
    try {
        const { fileId } = await params;

        const bucket = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const deleteFile = await bucket.deleteOne({ _id: new ObjectId(fileId) });

        if (!deleteFile.deletedCount) {
            throw new Error('File not found or already deleted');
        }

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { message: 'Failed to delete file', error: error instanceof Error ? error.message : error },
            { status: 500 }
        );
    }
}