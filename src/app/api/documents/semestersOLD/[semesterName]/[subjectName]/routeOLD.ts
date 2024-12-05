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


export async function GET(req: Request, { params }: { params: { semesterName: string; subjectName: string } }) {
    const { semesterName, subjectName } = await params;
    const userId = req.headers.get("user-id");

    console.log(`Fetching subject: ${subjectName} for semester: ${semesterName} and user: ${userId}`);

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const collection = await connectToDatabase();

        const user = await collection.findOne(
            { _id: new ObjectId(userId), "semesters.name": semesterName },
            { projection: { "semesters.$": 1 } }
        );
    
        console.log('User found:', user);

        const semester = user?.semesters?.[0];
        console.log('Semester found:', semester);

        const subject = semester?.subjects?.includes(subjectName)
            ? { name: subjectName, topics: [] }
            : undefined;

        console.log('Subject found:', subject);

        if (!subject) {
            return NextResponse.json({ message: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ name: subject.name, topics: subject.topics || [] });
    } catch (error) {
        console.error("Error fetching topics:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(req: Request, { params }: { params: { semesterName: string; subjectName: string } }) {
    const { semesterName, subjectName } = await params;
    const { topic } = await req.json();
    const userId = req.headers.get("user-id");

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!topic || !topic.trim()) {
        return NextResponse.json({ message: "Topic name is required" }, { status: 400 });
    }

    try {
        const collection = await connectToDatabase();

        //Initialize the topics array if it doesn't exist
        const initSemesterAndSubject = await collection.updateOne(
            {
                _id: new ObjectId(userId),
                "semesters.name": semesterName,
            },
            {
                $addToSet: {
                    "semesters": { name: semesterName, subjects: [] }, // Ensure semester exists
                },
            },
            { upsert: true }

        );

        console.log("Ensure Semester Result:", initSemesterAndSubject);

        console.log("Initialization worked!");

        //Add the new topic
        const ensureSubjectResult = await collection.updateOne(
            {
                _id: new ObjectId(userId),
                "semesters.name": semesterName,
                "semesters.subjects.name": { $ne: subjectName }, // Check if the subject doesn't already exist
            },
            {
                $addToSet: {
                    "semesters.$.subjects": { name: subjectName, topics: [] }, // Add the subject
                },
            }
        );

        console.log("Ensure Subject Result:", ensureSubjectResult);

        const addTopicResult = await collection.updateOne(
            {
                _id: new ObjectId(userId),
                "semesters.name": semesterName,
                "semesters.subjects.name": subjectName,
            },
            {
                $addToSet: { "semesters.$[semester].subjects.$[subject].topics": { name: topic.trim() } },
            },
            {
                arrayFilters: [
                    { "semester.name": semesterName },
                    { "subject.name": subjectName },
                ],
            }
        );

        console.log("Add Topic Result:", addTopicResult);

        if (addTopicResult.modifiedCount === 0) {
            return NextResponse.json({ message: "Failed to add topic" }, { status: 400 });
        }

        //Fetch the updated list of topics to return
        const user = await collection.findOne(
            {
                _id: new ObjectId(userId),
                "semesters.name": semesterName,
            },
            {
                projection: { "semesters.$": 1 },
            }
        );

        // Fetch the updated list of topics to return
        const semester = user?.semesters?.[0];
        const subject = semester?.subjects?.find((s: any) => s.name === subjectName);

        return NextResponse.json({ name: subject?.name, topics: subject?.topics || [] });
    } catch (error) {
        console.error("Error adding topic:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
