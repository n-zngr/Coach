import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb";
import { ObjectId } from "mongodb";

const DATABASE_NAME = "todos";
const COLLECTION_NAME = "todo";

export async function GET(req: Request) {
    try {
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json(
                { error: "UserId is required" },
                { status: 400 }
            );
        }

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const todos = await collection.find({ userId }).toArray();
        return NextResponse.json(todos, { status: 200 });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json(
            { error: "Failed to fetch tasks" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const cookies = req.headers.get("cookie");
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json(
                { error: "UserId is required" },
                { status: 400 }
            );
        }

        const body = await req.json();
        if (!body.taskName || !body.date) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const taskPayload = {
            userId,
            taskName: body.taskName,
            date: body.date, // expected in "YYYY-MM-DD" format
            status: body.status || "planned",
            file: body.file || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const result = await collection.insertOne(taskPayload);

        // Combine insertedId with payload to form newTask
        const newTask = { ...taskPayload, _id: result.insertedId };
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json(
            { error: "Failed to create task" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        // Expect id, status, taskName, and optionally file in the request body.
        const { id, status, taskName, file } = body;
        if (!id || !status || !taskName) {
            return NextResponse.json(
                { error: "Missing id, status, or taskName" },
                { status: 400 }
            );
        }

        const updateFields: any = {
            taskName, // update taskName as well
            status,
            updatedAt: new Date(),
        };

        if (file) {
            updateFields.file = file;
        }

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: "Task not updated" }, { status: 400 });
        }
        return NextResponse.json({ message: "Task updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}