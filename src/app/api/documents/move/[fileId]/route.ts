import { NextResponse } from "next/server";
import { ObjectId } from 'mongodb';
import { getCollection } from "@/app/utils/mongodb";

export async function PATCH(req: Request, { params }: { params: { fileId: string }}) {
    const { fileId } = await params;

    if (!ObjectId.isValid(fileId)) {
        console.error(`Invalid fileId: ${fileId}`);
        return NextResponse.json({ message: 'Invalid fileId' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { semesterId, subjectId, topicId } = body;

        if (!semesterId || !subjectId || !topicId) {
            console.error('Missing required fields in request body');
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const filesColleciton = await getCollection('documents', 'fs.files');
        const updateResult = await filesColleciton.updateOne(
            { _id: new ObjectId(fileId) },
            { 
                $set: {
                    'metadata.semesterId': semesterId,
                    'metadata.subjectId': subjectId,
                    'metadata.topicId': topicId
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            console.warn(`No file found or modified for fileId: ${fileId}`);
            return NextResponse.json({ message: 'File not found or not modified' }, { status: 404 });
        }

        console.log(`File location updated for fileId: ${fileId}`);
        return NextResponse.json({ message: 'File location updated successfully'}, { status: 200 });
    } catch (error) {
        console.error(`Error updating file location for fileId: ${fileId}`, error);
        return NextResponse.json({ message: 'Error updating file location' }, { status: 500 });
    }
}