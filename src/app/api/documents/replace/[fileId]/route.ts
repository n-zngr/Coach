import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/app/utils/mongodb";

export async function POST(request: Request, { params }: { params: { fileId: string } }) {
  const { fileId } = await params;

    if (!ObjectId.isValid(fileId)) {
        console.error(`Invalid fileId: ${fileId}`);
        return NextResponse.json({ message: 'Invalid fileId' }, { status: 400 });
    }

    try {
        const formData = await request.formData();
        const fileFromForm = formData.get('file') as File | null;

        if (!fileFromForm) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        const filename = (formData.get('filename') as string) || fileFromForm.name;
        const arrayBuffer = await fileFromForm.arrayBuffer();
        const replacementFile = Buffer.from(arrayBuffer);
    
        const filesCollection = await getCollection('documents', 'fs.files');
        const chunksCollection = await getCollection('documents', 'fs.chunks');
    
        // Retrieve the old file document to preserve its metadata
        const oldFile = await filesCollection.findOne({ _id: new ObjectId(fileId) });
        const preservedMetadata = oldFile?.metadata || {};
    
        // Remove existing file metadata and chunks
        await filesCollection.deleteOne({ _id: new ObjectId(fileId) });
        await chunksCollection.deleteMany({ files_id: new ObjectId(fileId) });
    
        // Insert new file metadata using preserved metadata
        const newFile = {
            _id: new ObjectId(fileId),
            filename,
            length: replacementFile.length,
            uploadDate: new Date(),
            metadata: preservedMetadata,
        };
    
        const result = await filesCollection.insertOne(newFile);
        if (!result.acknowledged) {
            throw new Error('Failed to insert file metadata.');
        }
    
        // Insert file chunks
        const chunkSize = 255 * 1024; // 255KB chunks
        const chunks = [];
        for (let i = 0; i < replacementFile.length; i += chunkSize) {
            chunks.push({
                files_id: new ObjectId(fileId),
                n: Math.floor(i / chunkSize),
                data: replacementFile.slice(i, i + chunkSize)
            });
        }
        await chunksCollection.insertMany(chunks);
    
        console.log(`File replaced successfully for fileId: ${fileId}`);
        return NextResponse.json({ message: 'File replaced successfully' }, { status: 200 });
    } catch (error) {
        console.error(`Error replacing file for fileId: ${fileId}`, error);
        return NextResponse.json({ message: 'Error replacing file' }, { status: 500 });
    }
}