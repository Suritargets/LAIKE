import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/schema";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authenticated = await verifySession();
  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");

    let query = getDb()
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt));

    if (category) {
      query = query.where(eq(submissions.category, category)) as typeof query;
    }

    const rows = await query;

    return NextResponse.json({ submissions: rows });
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
