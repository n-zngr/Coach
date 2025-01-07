import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb";
import { hashPassword } from "@/app/utils/passwordHash";
import { getCollection } from "@/app/utils/mongodb";

const DATABASE_NAME = 'users';
const COLLECTION_NAME = 'users';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { fullname, email, password, confirmPassword } = body;

        if (!fullname || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { message: "Fullname, E-mail, password, and confirm password are required" }, 
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "Passwords do not match" },
                { status: 400 }
            );
        }

        const collection = await getCollection(DATABASE_NAME, COLLECTION_NAME);

        const existingUser = await collection.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ message: "Email is already registered" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const result = await collection.insertOne({
            fullname,
            email,
            hashedPassword,
            semesters: []
        });

        return NextResponse.json({message: "User registered successfully", result });
    } catch (error) {
        console.error("Error saving user:", error);
        return NextResponse.json({ message: "Failed to register user", error }, { status: 500 });
    }
}