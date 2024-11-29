import { NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

export async function GET(req: Request, context: { params: any }) {
    const { id } = await context.params;

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('documents');
        const bucket = new GridFSBucket(db);

        const downloadStream = bucket.openDownloadStream(new ObjectId(id));

        const chunks: Buffer[] = [];
        await new Promise((resolve, reject) => {
            downloadStream.on('data', (chunk) => chunks.push(chunk));
            downloadStream.on("end", resolve);
            downloadStream.on("error", reject);
        });

        const fileBuffer = Buffer.concat(chunks);

        return new Response(fileBuffer, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename=file_${id}`
            }
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to download file', error },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}