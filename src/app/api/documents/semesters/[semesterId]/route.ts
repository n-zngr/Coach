import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/app/utils/mongodb";

const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

export async function GET(req: Request, { params }: { params: { semesterId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId } = await params;

    if (!userId || !semesterId) {
        return NextResponse.json({ error: "UserId and SemesterId are required" }, { status: 400 });
    }

    try {
        const usersCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME)
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const semester = (user.semesters || []).find((sem: any) => sem.id === semesterId);

        if (!semester) {
            return NextResponse.json({ error: "Semester not found" }, { status: 404 });
        } 

        return NextResponse.json({ name: semester.name, subjects: semester.subjects || [] });
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
        const usersCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME)

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let subjectType = (user.subjectTypes || []).find((type: any) => type.name === name);

        if (!subjectType) {
            subjectType = { id: new ObjectId().toString(), name};
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $addToSet: { subjectTypes: subjectType } }
            );
        }

        const newSubject = {
            id: new ObjectId().toString(),
            name,
            typeId: subjectType.id,
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

export async function DELETE(req: Request, { params }: { params: { semesterId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId } = await params;
    const { subjectId } = await req.json();

    if (!userId || !semesterId || !subjectId) {
        return NextResponse.json({ error: "UserId, SemesterId, and SubjectId are required" }, { status: 400 });
    }

    try {
        const usersCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "semesters.id": semesterId },
            { $pull: { "semesters.$.subjects": { id: subjectId } } } as any // Reduces type-safety in TypeScript
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to delete subject" }, { status: 400 });
        }

        return NextResponse.json({ message: "Subject deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /documents/semesters/[semesterId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { semesterId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId } = await params;
    const { subjectId, name } = await req.json();

    if (!userId || !semesterId || !subjectId || !name) {
        return NextResponse.json({ error: "UserId, SemesterId, SubjectId, and Name are required" }, { status: 400 });
    }

    try {
        const usersCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "semesters.id": semesterId, "semesters.subjects.id": subjectId },
            { $set: { "semesters.$[semester].subjects.$[subject].name": name } },
            { arrayFilters: [{ "semester.id": semesterId }, { "subject.id": subjectId }] }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to update subject" }, { status: 400 });
        }

        return NextResponse.json({ message: "Subject updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error in PUT /documents/semesters/[semesterId]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}