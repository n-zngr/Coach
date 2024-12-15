import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
    const { fileId } = await params;

    if (!ObjectId.isValid) {
        return NextResponse.json({ message: 'Invalid fileId' }, { status: 400 });
    }

    try {
        const filesCollection = await getCollection('documents', 'fs.files');
        const chunksCollection = await getCollection('documents', 'fs.chunks');

        const file = await filesCollection.findOne({ _id: new ObjectId(fileId) });

        if (!file) {
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }

        const chunks = await chunksCollection
            .find({ files_id: new ObjectId(fileId) })
            .sort({ n: 1 })
            .toArray();
        
        if (!chunks.length) {
            return NextResponse.json({ message: 'File chunks not found' }, { status: 404 });
        }

        const fileBuffer = Buffer.concat(chunks.map(chunk => chunk.data.buffer));

        return new Response(fileBuffer, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename='${file.filename}'`,
                'Content-Type': file.contentType || 'application/octet-stream'
            }
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        return NextResponse.json({ message: 'Error fetching file' }, { status: 500 });
    }
}