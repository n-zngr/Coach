import { NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';
import { hashPassword } from '@/app/utils/passwordHash'; // Assuming you have this utility function

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

// Handler function to change the password
export const changePassword = async (req: Request) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const user = await collection?.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await hashPassword(password);
    await collection?.updateOne({ email }, { $set: { password: hashedPassword } });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: (error as { message: string }).message }, { status: 500 });
  }
};

export default changePassword;
