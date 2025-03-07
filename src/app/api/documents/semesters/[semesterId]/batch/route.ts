import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/app/utils/mongodb";

const DATABASE_NAME = "users";
const COLLECTION_NAME = "users";

export async function POST(req: Request, { params }: { params: { semesterId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId } = await params;
    const { subjects } = await req.json(); // Expect an array of subjects

    if (!userId || !semesterId || !Array.isArray(subjects)) {
        return NextResponse.json(
            { error: "UserId, SemesterId, and Subjects array are required" },
            { status: 400 }
        );
    }

    try {
        const usersCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prepare the new subjects and subject types
        const newSubjects = [];
        const newSubjectTypes = [];

        for (const subject of subjects) {
            const { name } = subject;

            if (!name) {
                console.error("Subject name is missing:", subject); // Debugging: Log missing names
                continue; // Skip this subject or handle the error
            }
        
            // Check if the subject type already exists
            let subjectType = (user.subjectTypes || []).find((type: any) => type.name === name);

            // If the subject type doesn't exist, create a new one
            if (!subjectType) {
                subjectType = { id: new ObjectId().toString(), name };
                newSubjectTypes.push(subjectType);
            }

            // Create the new subject
            const newSubject = {
                id: new ObjectId().toString(),
                name: name,
                typeId: subjectType.id,
                topics: [],
            };

            newSubjects.push(newSubject);
        }

        // Update the user document in a single operation
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId), "semesters.id": semesterId },
            {
                $addToSet: {
                    "semesters.$.subjects": { $each: newSubjects }, // Add all new subjects
                    subjectTypes: { $each: newSubjectTypes }, // Add new subject types if any
                },
            }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Failed to add subjects" }, { status: 400 });
        }

        return NextResponse.json(newSubjects, { status: 201 });
    } catch (error) {
        console.error("Error in POST /documents/semesters/[semesterId]/batch:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}