import { NextResponse } from 'next/server';
import { getCollection } from '@/app/utils/mongodb';
import { ObjectId } from 'mongodb';

const dbName = 'documents'
const dbCol = 'fs.files'
export async function DELETE(req: Request, { params }: { params: { id: string } }) {

    try {
        const { id } = await params;
        const collection = await getCollection(dbName,dbCol)
        const deleteFile = await collection.deleteOne({ _id: new ObjectId(id) });

        if (!deleteFile.deletedCount) {
            throw new Error('File not found or already deleted');
        }

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ message: 'Failed to delete file', error }, { status: 500 });
    }
}