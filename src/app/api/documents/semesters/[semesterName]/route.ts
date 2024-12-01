import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;
const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

let client: MongoClient | null = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
    }
    return client.db(DATABASE_NAME).collection(COLLECTION_NAME);
}

export async function GET(req: Request, { params }: { params: { semesterName: string }}) {
    const { semesterName } = await params;

    const userId = req.headers.get("user-id");

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const collection = await connectToDatabase();

        const user = await collection.findOne(
            { _id: new ObjectId(userId), "semesters.name": semesterName },
            { projection: { "semesters.$": 1 } }
        );

        if (!user || !user.semesters || user.semesters.length === 0) {
            return NextResponse.json({ message: "Semester not found" }, { status: 404 });
        }

        const semester = user.semesters[0];
        return NextResponse.json({
            name: semester.name,
            subjects: semester.subjects || [],
        });
    } catch (error) {
        console.error("Error fetching semester data:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { semesterName: string }}) {
    const { semesterName } = await params;
    const { subject } = await req.json();
    const userId = req.headers.get('user-id');

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized'}, { status: 401 });
    }

    if (!subject) {
        return NextResponse.json({ message: 'Subject name is required'}, { status: 400 });
    }

    try {
        const collection = await connectToDatabase();

        const result = await collection.updateOne(
            { _id: new ObjectId(userId), 'semesters.name': semesterName },
            { $push: { 'semesters.$.subjects': subject }}
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ message: 'Failed to add subject' }, { status: 400 });
        }

        const user = await collection.findOne(
            { _id: new ObjectId(userId), 'semesters.name': semesterName },
            { projection: { 'semesters.$': 1} }
        );

        const semester = user?.semesters?.[0];
        return NextResponse.json({ name: semester.name, subjects: semester.subjects || [] });
    } catch (error) {
        console.error('Error adding subject:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}