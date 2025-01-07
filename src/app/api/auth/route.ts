import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/app/utils/mongodb';
import { ObjectId } from 'mongodb';

const dbName = 'users';
const dbCol = 'users';

export async function GET(req: NextRequest) {
    const cookies = req.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];

    if (!userId) {
        console.error('UserId cookie could not be found');
        return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    if (!ObjectId.isValid(userId)) {
        console.error('UserId is not a valid ObjectId');
        return NextResponse.json({ message: 'Invalid userId' }, { status: 401 });
    }

    try {
        const collection = await getCollection(dbName, dbCol);
        const user = await collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            console.error(`User with userId: ${userId} not found in database`);
            return NextResponse.json({ message: 'User not found' }, { status: 401 });
        }

        return NextResponse.json({ message: 'User authenticated', user });
    } catch (error) {
        console.error('error in /api/auth: ', error);
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}

