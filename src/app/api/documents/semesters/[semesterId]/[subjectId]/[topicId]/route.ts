import { NextResponse } from 'next/server';
import { getCollection } from '@/app/utils/mongodb';
import { ObjectId } from 'mongodb';

const dbName = 'users';
const dbCol = 'users';

export async function GET(req: Request, { params }: { params: { semesterId: string; subjectId: string; topicId: string } }) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];
    const { semesterId, subjectId, topicId } = await params;

    if (!userId || !semesterId || !subjectId || !topicId) {
        return NextResponse.json({ error: 'UserId, SemesterId, SubjectId, TopicId required' }, { status: 400 });
    }

    try {
        const usersCollection = await getCollection(dbName, dbCol)

        const user = await usersCollection.findOne({ _id: new ObjectId(userId)});

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

        console.log(topic);
        return NextResponse.json({ semesterName: semester.name, subjectName: subject.name, topic: topic });
    } catch (error) {
        console.error('Error in GET /documents/semesters/[semesterId]/[subjectId]/[topicId]:', error);
        return NextResponse.json({ error: 'Internal Server Error'}, { status: 500 });
    }
}