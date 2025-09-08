import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/utils/appwrite/auth';

export async function POST(req: NextRequest) {
  try {
    // Logout user (delete all sessions)
    await authService.logout();

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Even if logout fails on the server, we should still return success
    // to allow the client to clear local state
    return NextResponse.json({
      success: true,
      message: 'Logout completed',
      warning: 'Server logout may have failed, but local session cleared'
    });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
