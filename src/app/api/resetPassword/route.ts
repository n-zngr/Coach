import { NextResponse } from "next/server";
import { getCollection } from "@/app/utils/mongodb";
import { hashPassword } from "@/app/utils/passwordHash";

const dbName = "users";
const dbCol = "users";
export async function POST(request: Request) {
  try {
    const { email, password} = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }
    const collection = await getCollection(dbName, dbCol);

    const user = await collection.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Use your custom password hashing utility
    const newpassword = await hashPassword(password);

    // Update user's password and clear the reset token
    await collection.updateOne(
      { email },
      { $set: {hashedPassword: newpassword}}
    );

    return NextResponse.json({ message: "Password reset successful!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred while resetting the password." },
      { status: 500 }
    );
  }
}
