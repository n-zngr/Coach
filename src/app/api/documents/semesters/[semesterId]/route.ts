import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from 'next/headers';

const MONGODB_URI = process.env.MONGODB_URI!;
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

export async function GET(req: Request, { params }: { params: { semesterId: string } }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    const { semesterId } = params;

    if (!userId || !semesterId) {
        return NextResponse.json({ error: "UserId and SemesterId are required" }, { status: 400 });
    }

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        client.close();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const semester = (user.semesters || []).find((sem: any) => sem.id === semesterId);

        if (!semester) {
            return NextResponse.json({ error: "Semester not found" }, { status: 404 });
        }

        return NextResponse.json({ subjects: semester.subjects || [] });
    } catch (error) {
        console.error("Error in GET /documents/semesters/[semesterId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { semesterId: string } }) {
    const userId = req.headers.get("user-id");
    const { semesterId } = await params;
    const { name } = await req.json();

    if (!userId || !semesterId || !name) {
        return NextResponse.json({ error: "UserId, SemesterId, and Subject Name are required" }, { status: 400 });
    }

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const newSubject = {
            id: new ObjectId().toString(),
            name,
            topics: [],
        };

        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "semesters.id": semesterId },
            { $addToSet: { "semesters.$.subjects": newSubject } }
        );

        client.close();

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to add subject" }, { status: 400 });
        }

        return NextResponse.json(newSubject, { status: 201 });
    } catch (error) {
        console.error("Error in POST /documents/[semesterId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
