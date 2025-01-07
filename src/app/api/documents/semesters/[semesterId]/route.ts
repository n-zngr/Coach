import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb";
import { ObjectId } from "mongodb";

const dbName = "users";
const dbCol = "users";

export async function GET(req: Request, { params }: { params: { semesterId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId } = await params;

    if (!userId || !semesterId) {
        return NextResponse.json({ error: "UserId and SemesterId are required" }, { status: 400 });
    }

    try {
        const usersCollection = await getCollection(dbName, dbCol)
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const semester = (user.semesters || []).find((sem: any) => sem.id === semesterId);

        if (!semester) {
            return NextResponse.json({ error: "Semester not found" }, { status: 404 });
        } 

        return NextResponse.json(semester.subjects || []);
    } catch (error) {
        console.error("Error in GET /documents/semesters/[semesterId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { semesterId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId } = await params;
    const { name } = await req.json();

    if (!userId || !semesterId || !name) {
        return NextResponse.json({ error: "UserId, SemesterId, and Subject Name are required" }, { status: 400 });
    }

    try {
        const usersCollection = await getCollection(dbName, dbCol)
        const newSubject = {
            id: new ObjectId().toString(),
            name,
            topics: [],
        };

        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "semesters.id": semesterId },
            { $addToSet: { "semesters.$.subjects": newSubject } }
        );


        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to add subject" }, { status: 400 });
        }

        return NextResponse.json(newSubject, { status: 201 });
    } catch (error) {
        console.error("Error in POST /documents/[semesterId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}