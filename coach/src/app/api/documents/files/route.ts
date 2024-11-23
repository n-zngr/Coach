import { NextResponse } from "next/server";
import { MongoClient, GridFSBucket } from "mongodb";

const uri = process.env.MONGODB_URI as string;

export async function GET() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("documents");
        const bucket = new GridFSBucket(db);

        const fileList: any[] = [];
        const cursor = bucket.find();

        for await (const file of cursor) {
            fileList.push(file);
        }

        return NextResponse.json(fileList);
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to retrieve files", error },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}