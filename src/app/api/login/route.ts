import { NextResponse } from "next/server";
import { MongoClient, Db, Collection } from "mongodb";
import { verifyPassword } from "@/app/utils/passwordHash";

const uri = process.env.MONGODB_URI as string;
const dbName = "users";
const collectionName = "users"; 

let client: MongoClient | null = null;

async function connectToDatabase(): Promise<Collection> {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    const db: Db = client.db(dbName);
    return db.collection(collectionName);
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
        }

        const collection = await connectToDatabase();

        const user = await collection.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isMatch = verifyPassword(password, user.hashedPassword);

        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const response = NextResponse.json({ message: 'Login successful' });

        response.cookies.set('userId', user._id.toString(), {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });

        return response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        console.error("Error during login:", error);
        return NextResponse.json({ message: "Failed to login", error: errorMessage }, { status: 500 });
    }
}