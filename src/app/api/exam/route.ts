import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb";
import { ObjectId } from "mongodb";

const DATABASE_NAME = "todos";
const COLLECTION_NAME = "exam";

export async function GET(req: Request) {
    try {
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const exams = await collection.find({ userId }).toArray();
        return NextResponse.json(exams, { status: 200 });
    } catch (error) {
        console.error("Error fetching exams:", error);
        return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }

        const body = await req.json();
        if (!body.examName || !body.date) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const examPayload = {
            userId,
            examName: body.examName,
            date: body.date, // expected in "YYYY-MM-DD" format
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const result = await collection.insertOne(examPayload);

        // Combine insertedId with payload to form newExam
        const newExam = { ...examPayload, _id: result.insertedId };
        return NextResponse.json(newExam, { status: 201 });
    } catch (error) {
        console.error("Error creating exam:", error);
        return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        // Expect exam id, examName and date in the request body for updating
        const { id, examName, date } = body;
        if (!id || !examName || !date) {
            return NextResponse.json(
                { error: "Missing id, examName, or date" },
                { status: 400 }
            );
        }

        const updateFields: any = {
            examName,
            date,
            updatedAt: new Date(),
        };

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: "Exam not updated" }, { status: 400 });
        }
        return NextResponse.json({ message: "Exam updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating exam:", error);
        return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
    }
}