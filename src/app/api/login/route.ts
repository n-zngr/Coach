import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb";
import { verifyPassword } from "@/app/utils/passwordHash";

const DATABASE_NAME = 'users';
const COLLECTION_NAME = 'users'; 

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
        }

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        const user = await collection.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isMatch = await verifyPassword(password, user.hashedPassword);

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
