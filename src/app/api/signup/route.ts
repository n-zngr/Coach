import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb";
import { hashPassword } from "@/app/utils/passwordHash";

const db_Name = "users";
const col_Name = "users";

export async function POST(request: Request) {
    try {
        const body = await request.json(); // Parse the incoming JSON

        // Destructure fields from the request body
        const { fullname, email, password, confirmPassword } = body;

        // Check for missing fields
        if (!fullname || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { message: "Fullname, E-mail, password, and confirm password are required" }, 
                { status: 400 }
            );
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "Passwords do not match" },
                { status: 400 }
            );
        }

        // Connect to the MongoDB database and get the collection
        const collection = await getCollection(db_Name, col_Name);

        // Check if the email already exists
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