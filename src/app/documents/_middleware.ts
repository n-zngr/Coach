import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const dbName = "users";
const collectionName = "users";

let client: MongoClient | null = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db(dbName).collection(collectionName);
}

export async function middleware(req: NextRequest) {
    // Get userId from cookies
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const collection = await connectToDatabase();

        // Check if userId exists in the database
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    } catch (error) {
        console.error('Error validating user in middleware:', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Allow the request to proceed if user is valid
    return NextResponse.next();
}