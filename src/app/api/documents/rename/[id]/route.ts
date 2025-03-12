import { NextResponse } from 'next/server';
import { getCollection } from '@/app/utils/mongodb';
import { ObjectId } from 'mongodb';

const DATABASE_NAME = 'documents'
const COLLECTION_NAME = 'fs.files'
export async function PATCH(req: Request, { params }: { params: { id: string } }) {

    try {
        const { id } = await params;
        const fileId = id;
        const { newFilename } = await req.json();

        if (!newFilename) {
            return NextResponse.json({ message: 'New filename is required' }, { status: 400 });
        }
        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME)

        const result = await collection.updateOne(
            { _id: new ObjectId(fileId) },
            { $set: { filename: newFilename } }
        );
/*
        if (result.modifiedCount === 0) {
            throw new Error('File not found or update failed');
        }*/

        return NextResponse.json({ message: 'File renamed successfully' });
    } catch (error) {
        console.error('Error renaming file:', error);
        return NextResponse.json({ message: 'Failed to rename file', error }, { status: 500 });
    }
}