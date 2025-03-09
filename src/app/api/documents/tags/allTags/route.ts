import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

const USER_DB = 'users';
const USER_COL = 'users';

export async function GET(request: Request) {
    try {
        const cookies = request.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
        }

        const usersCollection = await getCollection(USER_DB, USER_COL);
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ tags: user.tags || [] });
    } catch (error: any) {
        console.error('Error in GET /api/documents/tags/allTags:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}