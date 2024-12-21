import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DATABASE_NAME = 'users';
const COLLECTION_NAME = 'users';

export async function GET(req: Request) {
    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    
        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }

        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        client.close();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const semesters = user.semesters || [];
        return NextResponse.json(semesters);
    } catch (error) {
        console.error("Error in GET /documents/semesters:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        
        const { name } = await req.json();

        if (!userId || !name) {
            return NextResponse.json({ error: "UserId and semester name are required" }, { status: 400 });
        }

        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const newSemester = {
            id: new ObjectId().toString(),
            name,
            subjects: [],
        };

        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { semesters: newSemester } }
        );

        client.close();

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to add semester" }, { status: 400 });
        }

        return NextResponse.json(newSemester, { status: 201 });
    } catch (error) {
        console.error("Error in POST /documents/semesters:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}