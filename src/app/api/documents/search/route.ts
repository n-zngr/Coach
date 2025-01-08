import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection, closeMongoDB } from '@/app/utils/mongodb';

const DATABASE_NAME = 'documents';
const FILES_COLLECTION_NAME = 'fs.files';
const USERS_COLLECTION_NAME = 'users';  // Assuming this collection stores user data with subjects

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
        if (subjectTypeId) {
            subjectIds = user.semesters.flatMap((semester: any) =>
                semester.subjects
                    .filter((subject: any) => subject.typeId === subjectTypeId)
                    .map((subject: any) => subject.id)
            );
        }

        if (!query || query.trim() === '') {
            return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }

        const filesCollection = await getCollection(DATABASE_NAME, FILES_COLLECTION_NAME);
        const usersCollection = await getCollection(DATABASE_NAME, USERS_COLLECTION_NAME);

        // Fetch user information
        const user = await usersCollection.findOne({ id: userId });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get subjects from user data
        let subjectIds: string[] = [];
        if (subjectTypeId && user.metadata?.subjects) {
            // Filter subjects that match the subjectTypeId
            subjectIds = user.metadata.subjects
                .filter((subject: { subjectTypeId: string }) => subject.subjectTypeId === subjectTypeId)
                .map((subject: { _id: string }) => subject._id.toString());  // Assuming subject._id is the subjectId
        }

        const searchQuery: any = {
            'metadata.userId': userId,
            'filename': { $regex: query || '', $options: 'i' },
        };
        
        if (subjectIds.length > 0) {
            searchQuery['metadata.subjectId'] = { $in: subjectIds };
        }

        // If subjectIds are available, include them in the query
        if (subjectIds.length > 0) {
            searchQuery['metadata.subjectId'] = { $in: subjectIds };
        }

        console.log('Search Query:', JSON.stringify(searchQuery, null, 2));

        // Search for files matching the query and subjectIds
        const files = await filesCollection.find(searchQuery).limit(6).toArray();
        console.log('Files State:', files);

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error('Error searching files: ', error);
        return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
    }/* finally {
        await closeMongoDB();
    }*/
}
