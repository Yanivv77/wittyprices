import { NextResponse } from "next/server";
import { cleanupInvalidPrices } from "@/lib/actions";

export async function GET(request: Request) {
  try {
    await cleanupInvalidPrices();
    
    return NextResponse.json({
      message: "Database cleanup completed successfully"
    });
  } catch (error: any) {
    return NextResponse.json({
      error: `Failed to cleanup database: ${error.message}`
    }, { status: 500 });
  }
} 