import { NextResponse } from 'next/server';
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
            return NextResponse.json({ error: 'UserId is required'}, { status: 401 });
        }

        if (!query || query.trim() === '') {
            return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }

        const filesCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        const searchQuery: any = {
            'metadata.userId': userId,
            'filename': { $regex: query, $options: 'i' }
        };

        const files = await filesCollection.find(searchQuery).limit(6).toArray();
        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error('Error searching files: ', error);
        return NextResponse.json({ message: 'Failed to search files', error }, { status: 500 });
    }
}