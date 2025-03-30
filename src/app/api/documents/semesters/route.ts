import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const dbName = 'users';
const dbCol = 'users';

export async function GET(req: Request) {
    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    
        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }

        const usersCollection = await getCollection(dbName, dbCol)
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

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

        const usersCollection = await getCollection(dbName,dbCol)
        const newSemester = {
            id: new ObjectId().toString(),
            name,
            subjects: [],
        };

        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { semesters: newSemester } }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to add semester" }, { status: 400 });
        }

        return NextResponse.json(newSemester, { status: 201 });
    } catch (error) {
        console.error("Error in POST /documents/semesters:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        const { semesterId } = await req.json();

        if (!userId || !semesterId) {
            return NextResponse.json({ error: "UserId and semesterId are required" }, { status: 400 });
        }

        const usersCollection = await getCollection(dbName, dbCol);
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { semesters: { id: semesterId } } } as any // Reduces type-safety in TypeScript
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to delete semester" }, { status: 400 });
        }

        return NextResponse.json({ message: "Semester deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /documents/semesters:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];
        const { semesterId, name } = await req.json();

        if (!userId || !semesterId || !name) {
            return NextResponse.json({ error: "UserId, semesterId, and name are required" }, { status: 400 });
        }

        const usersCollection = await getCollection(dbName, dbCol);
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "semesters.id": semesterId },
            { $set: { "semesters.$.name": name } }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to update semester" }, { status: 400 });
        }

        return NextResponse.json({ message: "Semester updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error in PUT /documents/semesters:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}