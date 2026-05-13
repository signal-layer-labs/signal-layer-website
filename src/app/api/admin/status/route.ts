import { NextResponse } from "next/server";
import { getAdminStatus } from "@/lib/admin";

export async function GET(request: Request) {
  return NextResponse.json(await getAdminStatus(request));
}
