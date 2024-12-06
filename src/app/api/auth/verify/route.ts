import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const db = 'users';
const collectionName = 'users';

let client: MongoClient | null = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db(db).collection(collectionName);
}

export async function GET(req: Request) {
    try {
        const userId = req.headers.get('user-id');

        if (!userId) {
            return NextResponse.json({ isLoggedIn: false }, { status: 401 });
        }

        const collection = await connectToDatabase();
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ isLoggedIn: false }, { status: 401 });
        }

        return NextResponse.json({ isLoggedIn: true });
    } catch (error) {
        console.error("Error verifying login: ", error);
        return NextResponse.json({ isLoggedIn: false }, { status: 500 });
    }
}