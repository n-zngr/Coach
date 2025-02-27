import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const DATABASE_NAME = 'documents';
const COLLECTION_NAME = 'fs.files';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query } = body;

        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 401 });
        }

        const usersCollection = await getCollection('users', 'users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!query?.trim()) {
            return NextResponse.json({ error: 'No search parameters provided' }, { status: 400 });
        }

        // 🔹 Suche nach Subjects mit explizitem Typ für subject
        const matchingSubjects = user.semesters.flatMap((semester: any) =>
            semester.subjects
                .filter((subject: { name: string }) =>
                    subject.name.toLowerCase().includes(query.toLowerCase())
                )
                .map((subject: { id: string; name: string }) => ({
                    type: 'subject',
                    id: subject.id,
                    name: subject.name,
                    semesterId: semester.id,
                    semesterName: semester.name
                }))
        );

        const filesCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        // 🔹 Standard-Dateisuche
        const searchQuery: any = {
            'metadata.userId': userId,
            $or: [
                { 'filename': { $regex: query, $options: 'i' } },
                { 'metadata.folderName': { $regex: query, $options: 'i' } },
                { 'metadata.subjectName': { $regex: query, $options: 'i' } },
                { 'metadata.semesterName': { $regex: query, $options: 'i' } }
            ]
        };

        let files = await filesCollection.find(searchQuery).limit(6).toArray();

        // 🔹 Verbinde jedes File mit dem entsprechenden Subject und Semester
        files = files.map((file: any) => {
            let foundSubject: any = null;
            // Suche das Subject, dessen ID mit file.metadata.subjectId übereinstimmt
            for (const semester of user.semesters) {
                const subject = semester.subjects.find((subject: any) => subject.id === file.metadata.subjectId);
                if (subject) {
                    foundSubject = subject;
                    break;
                }
            }
            // Finde das Semester anhand der semesterId
            const foundSemester = user.semesters.find((semester: any) =>
                semester.id === file.metadata.semesterId
            );

            if (foundSubject) {
                file.metadata.subjectName = foundSubject.name;
            }
            if (foundSemester) {
                file.metadata.semesterName = foundSemester.name;
            }

            return file;
        });

        // 🔹 Kombiniere Subjects und Files in einer einzigen Antwort
        const results = [...matchingSubjects, ...files];

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('Error searching files: ', error);
        return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
    }
}
