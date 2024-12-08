import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DATABASE_NAME = 'users';
const COLLECTION_NAME = 'users';

export async function GET(req: Request, { params }: { params: { semesterId: string; subjectId: string; topicId: string } }) {
    const userId = req.headers.get('user-id');
    const { semesterId, subjectId, topicId } = await params;

    if (!userId || !semesterId || !subjectId || !topicId) {
        return NextResponse.json({ error: 'UserId, SemesterId, SubjectId, TopicId required' }, { status: 400 });
    }

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const user = await usersCollection.findOne({ _id: new ObjectId(userId)});

        client.close();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const semester = (user.semesters || []).find((sem: any) => sem.id === semesterId);

        if (!semester) {
            return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
        }

        const subject = (semester.subjects || []).find((sub: any) => sub.id === subjectId);

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        const topic = (subject.topics || []).find((top: any) => top.id === topicId);

        if (!topic) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        return NextResponse.json(topic);
    } catch (error) {
        console.error('Error in GET /documents/semesters/[semesterId]/[subjectId]/[topicId]:', error);
        return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 });
    }
}