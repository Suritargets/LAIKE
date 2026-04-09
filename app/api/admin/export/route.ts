import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/schema";
import { verifySession } from "@/lib/auth";

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatAmount(amount: number | null): string {
  if (amount === null || amount === undefined) return "";
  return (amount / 100).toFixed(2);
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const authenticated = await verifySession();
  if (!authenticated) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
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

    const header = "Naam,Email,Categorie,Bedrijf,Telefoon,Bericht,Bedrag,Datum";
    const dataRows = rows.map((row) => {
      return [
        escapeCsvField(row.name),
        escapeCsvField(row.email),
        escapeCsvField(row.category),
        escapeCsvField(row.company ?? ""),
        escapeCsvField(row.phone ?? ""),
        escapeCsvField(row.message ?? ""),
        formatAmount(row.amount),
        formatDate(new Date(row.createdAt)),
      ].join(",");
    });

    const csv = [header, ...dataRows].join("\n");
    const today = formatDate(new Date());

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="laike-submissions-${today}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export submissions:", error);
    return new Response(JSON.stringify({ error: "Failed to export" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
