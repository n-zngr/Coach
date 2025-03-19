/*import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/app/utils/mongodb";

const USER_DB = "users";
const USER_COL = "users";
const LINK_DB = "documents";
const LINK_COL = "links";

async function cleanupUnusedTags(userId: string) {
    try {
        const linksCollection = await getCollection(LINK_DB, LINK_COL);
        const links = await linksCollection.find({ "metadata.userId": userId }).toArray();
        const usedTagIds = new Set<string>();
        links.forEach((link) => {
            const linkTags = link.metadata?.tags || [];
            linkTags.forEach((tag: any) => {
                if (tag.id) {
                    usedTagIds.add(tag.id);
                }
            });
        });
        const usersCollection = await getCollection(USER_DB, USER_COL);
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { tags: { id: { $nin: Array.from(usedTagIds) } } } } as any
        );
    } catch (error) {
        console.error("Error cleaning up unused link tags:", error);
    }
}

export async function POST(req: Request) {
    try {
        const { linkId, tag } = await req.json();
        if (!linkId || !tag || typeof tag !== "string" || tag.trim() === "") {
            return NextResponse.json({ error: "linkId and a valid tag are required" }, { status: 400 });
        }
        const trimmedTag = tag.trim();
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }
        const usersCollection = await getCollection(USER_DB, USER_COL);
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        let globalTag = user.tags?.find((t: any) => t.name.toLowerCase() === trimmedTag.toLowerCase());
        if (!globalTag) {
            globalTag = { id: new ObjectId().toString(), name: trimmedTag };
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $addToSet: { tags: globalTag } }
            );
        }
        const linksCollection = await getCollection(LINK_DB, LINK_COL);
        const updateResult = await linksCollection.updateOne(
            { _id: new ObjectId(linkId) },
            { $addToSet: { "metadata.tags": globalTag } }
        );
        if (updateResult.modifiedCount === 0) {
            const linkDoc = await linksCollection.findOne({ _id: new ObjectId(linkId) });
            await cleanupUnusedTags(userId);
            return NextResponse.json({ tags: linkDoc?.metadata?.tags || [] });
        }
        const updatedLink = await linksCollection.findOne({ _id: new ObjectId(linkId) });
        await cleanupUnusedTags(userId);
        return NextResponse.json({ tags: updatedLink?.metadata?.tags || [] }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/documents/link-tags:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}*/