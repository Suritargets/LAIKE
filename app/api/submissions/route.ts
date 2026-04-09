import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/schema";

const VALID_CATEGORIES = ["early_access", "demo", "donate"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, company, phone, message, category, amount } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Category must be one of: early_access, demo, donate" },
        { status: 400 }
      );
    }

    // Validate optional amount
    if (amount !== undefined && amount !== null) {
      if (!Number.isInteger(amount)) {
        return NextResponse.json(
          { error: "Amount must be an integer (cents)" },
          { status: 400 }
        );
      }
    }

    const [inserted] = await getDb()
      .insert(submissions)
      .values({
        name: name.trim(),
        email: email.trim(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        category,
        amount: amount ?? null,
      })
      .returning({ id: submissions.id });

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (error) {
    console.error("Failed to create submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 400 }
    );
  }
}
