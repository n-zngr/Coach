import { NextResponse } from 'next/server';

import { ObjectId } from 'mongodb';
import { getCollection } from '@/app/utils/mongodb';

export async function GET(req: Request) {
    try {
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

        const subjectTypes = user.subjectTypes.map((type: any) => ({
            id: type.id,
            name: type.name,
        }));

        return NextResponse.json(subjectTypes, { status: 200 });
    } catch (error) {
        console.error('Error fetching subject types:', error);
        return NextResponse.json({ message: 'Failed to fetch subject types', error }, { status: 500 });
    }
}