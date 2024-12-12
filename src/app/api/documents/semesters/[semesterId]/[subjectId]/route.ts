import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

export async function GET(req: Request, { params }: { params: { semesterId: string; subjectId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId, subjectId } = await params;

    if (!userId || !semesterId || !subjectId) {
        return NextResponse.json({ error: "UserId, SemesterId, and SubjectId are required" }, { status: 400 });
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

        const subject = (semester.subjects || []).find((sub: any) => sub.id === subjectId);

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json(subject.topics || []);
    } catch (error) {
        console.error("Error in GET /documents/[semesterId]/[subjectId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { semesterId: string; subjectId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId, subjectId } = await params;
    const { name } = await req.json();

    if (!userId || !semesterId || !subjectId || !name) {
        return NextResponse.json({ error: "UserId, SemesterId, SubjectId, and Topic Name are required" }, { status: 400 });
    }

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const newTopic = {
            id: new ObjectId().toString(),
            name,
        };

        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "semesters.id": semesterId, "semesters.subjects.id": subjectId },
            { $addToSet: { "semesters.$[semester].subjects.$[subject].topics": newTopic } },
            { arrayFilters: [{ "semester.id": semesterId }, { "subject.id": subjectId }] }
        );

        client.close();

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to add topic" }, { status: 400 });
        }

        return NextResponse.json(newTopic, { status: 201 });
    } catch (error) {
        console.error("Error in POST /documents/[semesterId]/[subjectId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
