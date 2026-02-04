import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const ctx = getRequestContext();
    
    return NextResponse.json({
      success: true,
      hasContext: !!ctx,
      hasEnv: !!ctx?.env,
      hasDB: !!ctx?.env?.DB,
      envKeys: ctx?.env ? Object.keys(ctx.env) : [],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
