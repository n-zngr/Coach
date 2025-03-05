import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/app/utils/mongodb";

export async function POST(req: Request, { params }: { params: { fileId: string } }) {
    const { fileId } = await params;

    if (!ObjectId.isValid(fileId)) {
        console.error(`Invalid fileId: ${fileId}`);
        return NextResponse.json({ message: "Invalid fileId" }, { status: 400 });
    }

    try {
        // Parse incoming file data
        const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return NextResponse.json({ message: "Invalid content type" }, { status: 400 });
        }

        const boundary = contentType.split("boundary=")[1];
        if (!boundary) {
            return NextResponse.json({ message: "Invalid boundary in content type" }, { status: 400 });
        }

        // Read and parse the multipart form data
        const body = await req.text();
        const parts = body.split(`--${boundary}`).filter((part) => part.trim() && !part.includes("--"));
        const formData: Record<string, string | Buffer> = {};

        for (const part of parts) {
            const [headers, content] = part.split("\r\n\r\n");
            const dispositionMatch = headers.match(/name="([^"]+)"/);
            const name = dispositionMatch?.[1];

            if (name === "file") {
                const fileBuffer = Buffer.from(content.trim(), "binary");
                formData[name] = fileBuffer;
            } else if (name) {
                formData[name] = content.trim();
            }
        }

        const replacementFile = formData.file as Buffer;
        const filename = formData.filename as string || "unknown";

        if (!replacementFile) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        const filesCollection = await getCollection("documents", "fs.files");
        const chunksCollection = await getCollection("documents", "fs.chunks");

        // Remove existing file metadata and chunks
        await filesCollection.deleteOne({ _id: new ObjectId(fileId) });
        await chunksCollection.deleteMany({ files_id: new ObjectId(fileId) });

        // Insert new file metadata
        const newFile = {
            _id: new ObjectId(fileId),
            filename,
            length: replacementFile.length,
            uploadDate: new Date(),
            metadata: {},
        };

        const result = await filesCollection.insertOne(newFile);

        if (!result.acknowledged) {
            throw new Error("Failed to insert file metadata.");
        }

        // Insert file chunks
        const chunkSize = 255 * 1024; // 255KB chunks
        const chunks = [];
        for (let i = 0; i < replacementFile.length; i += chunkSize) {
            chunks.push({
                files_id: new ObjectId(fileId),
                n: Math.floor(i / chunkSize),
                data: replacementFile.slice(i, i + chunkSize),
            });
        }

        await chunksCollection.insertMany(chunks);

        console.log(`File replaced successfully for fileId: ${fileId}`);
        return NextResponse.json({ message: "File replaced successfully" }, { status: 200 });
    } catch (error) {
        console.error(`Error replacing file for fileId: ${fileId}`, error);
        return NextResponse.json({ message: "Error replacing file" }, { status: 500 });
    }
}