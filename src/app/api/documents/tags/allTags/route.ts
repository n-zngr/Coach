import { NextResponse } from 'next/server';
import { getCollection } from '@/app/utils/mongodb';

export async function GET(request: Request) {
  try {
    const cookies = request.headers.get('cookie');
    const userId = cookies?.match(/userId=([^;]*)/)?.[1];

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const filesCollection = await getCollection('documents', 'fs.files');
    const linksCollection = await getCollection('documents', 'links');

    const fileDocs = await filesCollection.find({ 'metadata.userId': userId }).toArray();
    const linkDocs = await linksCollection.find({ 'metadata.userId': userId }).toArray();

    const fileTags = fileDocs.flatMap(doc => doc.metadata?.tags || []);
    const linkTags = linkDocs.flatMap(doc => doc.metadata?.tags || []);

    const combined = [...fileTags, ...linkTags];

    // Deduplicate by tag name
    const uniqueTags = Array.from(new Map(combined.map(tag => [tag.name, tag])).values());

    return NextResponse.json({ tags: uniqueTags });
  } catch (error: any) {
    console.error('Error in GET /api/documents/tags/allTags:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
