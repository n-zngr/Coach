import { NextResponse } from 'next/server';
import { getCollection } from '@/app/utils/mongodb';
import { ObjectId } from 'mongodb';

const DATABASE_NAME = 'users';
const COLLECTION_NAME = 'users';

export async function GET(req: Request) {
    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 401 });
        }

        const usersCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const subjectTypes = user.subjectTypes || [];
        return NextResponse.json(subjectTypes, { status: 200 });
    } catch (error) {
        console.error('Error fetching subject types:', error);
        return NextResponse.json({ message: 'Failed to fetch subject types', error }, { status: 500 });
    }

}