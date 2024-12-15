import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const dbName = 'users';
const collectionName = 'users';

let client: MongoClient | null = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db(dbName).collection(collectionName);
}

export async function middleware(req: NextRequest) {
    const userId = req.cookies.get('userId')?.value;

    if (!userId) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const collection = await connectToDatabase();
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in middleware', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/documents/:path*', '/api/:path*']
}