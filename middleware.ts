import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
const DATABASE_NAME = 'users';
const COLLECTION_NAME = 'users';

let client: MongoClient | null = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
    }
    return client.db(DATABASE_NAME).collection(COLLECTION_NAME);
}

export async function middleware(req: NextRequest) {
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
        console.warn('UserId cookie not found. Redirecting to /login.');
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (!ObjectId.isValid(userId)) {
        console.warn('UserId is not a valid ObjectId. Redirecting to /login.');
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const collection = await connectToDatabase();
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            console.warn(`User with userId: ${userId} not found in the database. Redirecting to /login.`);
            return NextResponse.redirect(new URL('/login', req.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in middleware: ', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/documents/:path*', '/api/:path*']
};