import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/app/utils/mongodb";

// Global user tags are stored in the "users" collection.
const USER_DB = "users";
const USER_COL = "users";

// Files and Links are in "documents" database.
const FILE_DB = "documents";
const FILE_COL = "fs.files";
const LINK_COL = "links";

async function cleanupUnusedTags(userId: string) {
    try {
        const filesCollection = await getCollection(FILE_DB, FILE_COL);
        const linksCollection = await getCollection(FILE_DB, LINK_COL);

        const [files, links] = await Promise.all([
            filesCollection.find({ "metadata.userId": userId }).toArray(),
            linksCollection.find({ "metadata.userId": userId }).toArray()
        ]);

        const usedTagIds = new Set<string>();
        for (const doc of [...files, ...links]) {
            const tags = doc.metadata?.tags || [];
            for (const tag of tags) {
                if (tag.id) {
                    usedTagIds.add(tag.id);
                }
            }
        }

        const usersCollection = await getCollection(USER_DB, USER_COL);
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { tags: { id: { $nin: Array.from(usedTagIds) } } } } as any
        );
    } catch (err) {
        console.error("Error cleaning unused tags:", err);
    }
}

async function getDocumentById(docId: string) {
    const filesCollection = await getCollection(FILE_DB, FILE_COL);
    const linksCollection = await getCollection(FILE_DB, LINK_COL);
    const objectId = new ObjectId(docId);

    const file = await filesCollection.findOne({ _id: objectId });
    if (file) return { doc: file, collection: filesCollection };

    const link = await linksCollection.findOne({ _id: objectId });
    if (link) return { doc: link, collection: linksCollection };

    return { doc: null, collection: null };
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const fileId = searchParams.get("fileId");
        if (!fileId) return NextResponse.json({ error: "fileId is required" }, { status: 400 });

        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        if (!userId) return NextResponse.json({ error: "UserId is required" }, { status: 400 });

        const { doc } = await getDocumentById(fileId);
        if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        await cleanupUnusedTags(userId);
        return NextResponse.json({ tags: doc.metadata?.tags || [] });
    } catch (error) {
        console.error("GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { fileId, tag } = await req.json();
        if (!fileId || !tag || typeof tag !== "string" || !tag.trim()) {
            return NextResponse.json({ error: "fileId and valid tag required" }, { status: 400 });
        }

        const trimmedTag = tag.trim();
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        if (!userId) return NextResponse.json({ error: "UserId required" }, { status: 400 });

        const usersCollection = await getCollection(USER_DB, USER_COL);
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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

        const { doc, collection } = await getDocumentById(fileId);
        if (!doc || !collection) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        await collection.updateOne(
            { _id: new ObjectId(fileId) },
            { $addToSet: { "metadata.tags": globalTag } }
        );

        const updatedDoc = await collection.findOne({ _id: new ObjectId(fileId) });
        await cleanupUnusedTags(userId);
        return NextResponse.json({ tags: updatedDoc?.metadata?.tags || [] }, { status: 201 });
    } catch (error) {
        console.error("POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        if (!userId) return NextResponse.json({ error: "UserId is required" }, { status: 400 });

        const { tagId, newName } = await req.json();
        if (!tagId || !newName || typeof newName !== "string" || !newName.trim()) {
            return NextResponse.json({ error: "Valid tagId and newName required" }, { status: 400 });
        }
        const trimmedName = newName.trim();

        const usersCollection = await getCollection(USER_DB, USER_COL);
        const userUpdate = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "tags.id": tagId },
            { $set: { "tags.$.name": trimmedName } }
        );
        if (userUpdate.modifiedCount === 0) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }

        const filesCollection = await getCollection(FILE_DB, FILE_COL);
        const linksCollection = await getCollection(FILE_DB, LINK_COL);

        const updateFiles = filesCollection.updateMany(
            { "metadata.tags.id": tagId },
            { $set: { "metadata.tags.$[elem].name": trimmedName } },
            { arrayFilters: [{ "elem.id": tagId }] }
        );

        const updateLinks = linksCollection.updateMany(
            { "metadata.tags.id": tagId },
            { $set: { "metadata.tags.$[elem].name": trimmedName } },
            { arrayFilters: [{ "elem.id": tagId }] }
        );

        const [filesUpdate, linksUpdate] = await Promise.all([updateFiles, updateLinks]);
        await cleanupUnusedTags(userId);

        return NextResponse.json({
            message: "Tag renamed",
            filesUpdate,
            linksUpdate,
        });
    } catch (error) {
        console.error("PUT error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { fileId, tag } = await req.json();
        if (!fileId || !tag) return NextResponse.json({ error: "fileId and tag are required" }, { status: 400 });

        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        if (!userId) return NextResponse.json({ error: "UserId required" }, { status: 400 });

        const { doc, collection } = await getDocumentById(fileId);
        if (!doc || !collection) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        await collection.updateOne(
            { _id: new ObjectId(fileId) },
            { $pull: { "metadata.tags": { name: tag } } } as any
        );

        const updatedDoc = await collection.findOne({ _id: new ObjectId(fileId) });
        await cleanupUnusedTags(userId);
        return NextResponse.json({ tags: updatedDoc?.metadata?.tags || [] });
    } catch (error) {
        console.error("DELETE error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
