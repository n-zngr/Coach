import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const DATABASE_NAME = 'documents';
const COLLECTION_NAME = 'fs.files';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, subjectTypeId } = body;

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

        let subjectIds: string[] = [];
        let semesterIds: string[] = [];
        let subjectNames: string[] = [];
        let semesterNames: string[] = [];

        // Extrahiere Fächer und Semester
        if (subjectTypeId) {
            subjectIds = user.semesters.flatMap((semester: any) =>
                semester.subjects
                    .filter((subject: any) => subject.typeId === subjectTypeId)
                    .map((subject: any) => subject.id)
            );
            subjectNames = user.semesters.flatMap((semester: any) =>
                semester.subjects
                    .filter((subject: any) => subject.typeId === subjectTypeId)
                    .map((subject: any) => subject.name) // Hier den Namen der Fächer extrahieren
            );
        }

        if (!query?.trim()) {
            return NextResponse.json({ error: 'No search parameters provided' }, { status: 400 });
        }

        const filesCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        // Suchanfrage unter Berücksichtigung der Namen und IDs
        const searchQuery: any = {
            'metadata.userId': userId,
            $or: [
                { 'filename': { $regex: query, $options: 'i' } },  // Suche nach Dateinamen
                { 'metadata.folderName': { $regex: query, $options: 'i' } },  // Suche nach Ordnernamen
                { 'metadata.subjectName': { $regex: query, $options: 'i' } },  // Suche nach Fachnamen
                { 'metadata.semesterName': { $regex: query, $options: 'i' } },  // Suche nach Semesternamen
                { 'metadata.subjectId': { $in: subjectIds } },  // Suche nach Fach-IDs
                { 'metadata.semesterId': { $in: semesterIds } }  // Suche nach Semester-IDs
            ]
        };

        const files = await filesCollection.find(searchQuery).limit(6).toArray();

        // Ergebnisse anreichern mit den Namen der Fächer und Semester
        const enrichedResults = files.map((file: any) => {
            const subjectName = user.semesters.flatMap((semester: any) => 
                semester.subjects
                    .filter((subject: any) => subject.id === file.metadata.subjectId)
                    .map((subject: any) => subject.name)
            )[0] || 'Unknown Subject';

            const semesterName = user.semesters.flatMap((semester: any) => 
                semester.id === file.metadata.semesterId
                    ? semester.name
                    : []
            )[0] || 'Unknown Semester';

            return {
                ...file,
                metadata: {
                    ...file.metadata,
                    subjectName: subjectName,
                    semesterName: semesterName
                }
            };
        });

        return NextResponse.json(enrichedResults, { status: 200 });
    } catch (error) {
        console.error('Error searching files: ', error);
        return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
    }
}
