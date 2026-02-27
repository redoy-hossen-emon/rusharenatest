import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BannedToken from "@/models/BannedToken";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token required" },
        { status: 400 }
      );
    }

    // Check if token exists in bannedTokens collection
    const banned = await BannedToken.findOne({ token });

    if (banned) {
      return NextResponse.json({
        success: true,
        banned: true,
        userId: banned.userId, // return userId linked to banned token
      });
    }

    // If not found
    return NextResponse.json({
      success: true,
      banned: false,
    });

  } catch (error) {
    console.error("CheckBanned Error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}