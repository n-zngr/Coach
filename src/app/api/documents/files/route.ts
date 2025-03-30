import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb"; // add closeMongoDB when used

const DATABASE_NAME = 'documents';
const COLLECTION_NAME = 'fs.files';

export async function GET(req: Request) {
    try {
        const cookies = req.headers.get('cookie');
        const userId = cookies?.match(/userId=([^;]*)/)?.[1];

        if (!userId) {
            return NextResponse.json({ error: "UserId is required" }, { status: 400 });
        }

        const semesterId = req.headers.get('semesterId');
        const subjectId = req.headers.get('subjectId');
        const topicId = req.headers.get('topicId');

        const filesCollection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        const query: any = { 'metadata.userId': userId };

        if (semesterId) query['metadata.semesterId'] = semesterId;
        if (subjectId) query['metadata.subjectId'] = subjectId;
        if (topicId) query['metadata.topicId'] = topicId;

        const files = await filesCollection.find({ ...query, url: { $exists: false } }).toArray();

        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ message: 'Failed to fetch files', error }, { status: 500 });
    }/*finally {
        closeMongoDB();
    }*/
}
