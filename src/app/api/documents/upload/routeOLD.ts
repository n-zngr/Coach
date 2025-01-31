import { NextResponse } from "next/server";
import { MongoClient, GridFSBucket } from "mongodb";
import { Readable } from "stream";

const uri = process.env.MONGODB_URI as string;

export async function POST(req: Request) {
    const client = new MongoClient(uri);

    try {
        const { fileName, fileContent, metadata } = await req.json();
        if (!fileName || !fileContent || !metadata) {
            return NextResponse.json(
                { message: "Missing required data for file upload" },
                { status: 400 }
            );
        }

        const fileBuffer = Buffer.from(fileContent, "base64");
        const fileStream = Readable.from(fileBuffer);

        await client.connect();
        const db = client.db("documents");
        const bucket = new GridFSBucket(db);

        const uploadStream = bucket.openUploadStream(fileName, {
            metadata: {
                userId: metadata.userId,
                semesterId: metadata.semesterId,
                subjectId: metadata.subjectId,
                topicId: metadata.topicId,
            },
        });

        fileStream.pipe(uploadStream);

        await new Promise((resolve, reject) => {
            uploadStream.on("finish", resolve);
            uploadStream.on("error", reject);
        });

        return NextResponse.json({ message: "File uploaded successfully" });
    } catch (error) {
        console.error("Error during file upload:", error);
        return NextResponse.json(
            { message: "Failed to upload file", error },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}
