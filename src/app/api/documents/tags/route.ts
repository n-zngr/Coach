import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/app/utils/mongodb";

// Global user tags are stored in the "users" collection.
const USER_DB = "users";
const USER_COL = "users";

// Files are stored in the "documents" database, collection "fs.files".
const FILE_DB = "documents";
const FILE_COL = "fs.files";

export async function GET(req: Request) {
    try {
        // Expect a fileId as a query parameter.
        const { searchParams } = new URL(req.url);
        const fileId = searchParams.get("fileId");
        if (!fileId) {
            return NextResponse.json({ error: "fileId query parameter is required" }, { status: 400 });
        }
        const filesCollection = await getCollection(FILE_DB, FILE_COL);
        const fileDoc = await filesCollection.findOne({ _id: new ObjectId(fileId) });
        if (!fileDoc) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
        // Assume file-specific tags are stored in metadata.tags.
        const tags = fileDoc.metadata?.tags || [];
        return NextResponse.json({ tags });
    } catch (error) {
        console.error("Error in GET /api/documents/tags:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { fileId, tag } = await req.json();
        if (!fileId || !tag || typeof tag !== "string" || tag.trim() === "") {
            return NextResponse.json({ error: "fileId and a valid tag are required" }, { status: 400 });
        }
        const trimmedTag = tag.trim();

        // Extract userId from the cookie.
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }

        // STEP 1: Update the global tag store in the user's document.
        const usersCollection = await getCollection(USER_DB, USER_COL);
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Check for an existing global tag (case-insensitive)
        let globalTag = user.tags?.find((t: any) =>
            t.name.toLowerCase() === trimmedTag.toLowerCase()
        );
        if (!globalTag) {
            globalTag = { id: new ObjectId().toString(), name: trimmedTag };
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $addToSet: { tags: globalTag } }
            );
        }

        // STEP 2: Update the file document to link to the global tag.
        const filesCollection = await getCollection(FILE_DB, FILE_COL);
        const updateResult = await filesCollection.updateOne(
            { _id: new ObjectId(fileId) },
            { $addToSet: { "metadata.tags": globalTag } }
        );
        if (updateResult.modifiedCount === 0) {
            const fileDoc = await filesCollection.findOne({ _id: new ObjectId(fileId) });
            return NextResponse.json({ tags: fileDoc?.metadata?.tags || [] });
        }
        const updatedFile = await filesCollection.findOne({ _id: new ObjectId(fileId) });
        return NextResponse.json({ tags: updatedFile?.metadata?.tags || [] }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/documents/tags:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { fileId, tag } = await req.json();
        if (!fileId || !tag) {
            return NextResponse.json({ error: "fileId and tag are required" }, { status: 400 });
        }
        // Extract userId from cookie (if needed for permissions)
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }
        // Update the file's tags in the files collection.
        const filesCollection = await getCollection(FILE_DB, FILE_COL);
        const updateResult = await filesCollection.updateOne(
            { _id: new ObjectId(fileId) },
            { $pull: { "metadata.tags": { name: tag } } } as any
        );
        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Tag not found or file not found" }, { status: 404 });
        }
        const updatedFile = await filesCollection.findOne({ _id: new ObjectId(fileId) });
        return NextResponse.json({ tags: updatedFile?.metadata?.tags || [] });
    } catch (error) {
        console.error("Error in DELETE /api/documents/tags:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}