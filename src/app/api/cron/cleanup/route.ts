// Vercel Cron hits this daily. Deletes care events older than 60 days.
// Protected by CRON_SECRET — Vercel sends the header automatically when configured.

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.careEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return NextResponse.json({ deleted: count, cutoff: cutoff.toISOString() });
}
