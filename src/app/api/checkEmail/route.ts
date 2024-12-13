import { NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
const DATABASE_NAME = 'users';
const COLLECTION_NAME = 'users';

let client: MongoClient | null = null;
let db: Db | null = null;
let collection: Collection | null = null;

// Function to connect to the database
const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);
  }
};

// Handler function for checking if email exists
export const checkEmailExists = async (req: Request) => {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const user = await collection?.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User found', email });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as { message: string }).message }, { status: 500 });
  }
};

export default checkEmailExists;
