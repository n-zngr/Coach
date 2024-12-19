import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('MongoDb connection string not found, ensure the .env file is located in the root of the project');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

export async function connectMongoDB(): Promise<MongoClient> {
    if (!client) {
        client = new MongoClient(MONGODB_URI);
        clientPromise = client.connect();
    }

    return clientPromise;
}

export async function getCollection(dbName: string, collectionName: string) {
    const client = await connectMongoDB();
    return client.db(dbName).collection(collectionName);
}