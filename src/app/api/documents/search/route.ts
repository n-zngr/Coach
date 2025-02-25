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

        // 🔹 Suche nach Subjects mit explizitem Typ für `subject`
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

        // 🔹 Falls ein Subject gefunden wurde, lade zusätzlich die zugehörigen Dateien und speichere sie im Subject
        if (matchingSubjects.length > 0) {
            const subjectNames = matchingSubjects.map((subject: { name: string }) => subject.name);
            const subjectFiles = await filesCollection.find({
                'metadata.userId': userId,
                'metadata.subjectName': { $in: subjectNames }
            }).toArray();

            // Verbinde jedes Subject mit den zugehörigen Dateien
            matchingSubjects.forEach((subject: any) => {
                subject.files = subjectFiles.filter((file: any) => file.metadata.subjectName === subject.name);
            });
        }

        // 🔹 Kombiniere Subjects und Files in einer einzigen Antwort
        const results = [...matchingSubjects, ...files];

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('Error searching files: ', error);
        return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
    }
}
