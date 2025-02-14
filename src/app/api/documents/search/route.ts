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
            return NextResponse.json({ error: 'UserId is required'}, { status: 401 });
        }
        
        const usersCollection = await getCollection('users', 'users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let subjectIds: string[] = [];
        if (subjectTypeId) {
            subjectIds = user.semesters.flatMap((semester: any) =>
                semester.subjects
                    .filter((subject: any) => subject.typeId === subjectTypeId)
                    .map((subject: any) => subject.id)
            );
        }

        if (!query?.trim() && !subjectTypeId) {
            return NextResponse.json({ error: 'No search parameters provided' }, { status: 400 });
        }

        const filesCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        const searchQuery: any = {
            'metadata.userId': userId,
            ...(query?.trim() && { 'filename': { $regex: query, $options: 'i' } }),
        };
        
        if (subjectIds.length > 0) {
            searchQuery['metadata.subjectId'] = { $in: subjectIds };
        }

        const files = await filesCollection.find(searchQuery).limit(6).toArray();
        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error('Error searching files: ', error);
        return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
    }
}