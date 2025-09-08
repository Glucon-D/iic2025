import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/utils/appwrite/auth';
import { databaseService } from '@/utils/appwrite/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Attempt login
    const session = await authService.login({ email, password });
    const user = await authService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to retrieve user information' },
        { status: 500 }
      );
    }

    // Check if user profile exists in our database
    let userProfile = null;
    try {
      userProfile = await databaseService.getUser(user.$id);
    } catch (error) {
      // User profile doesn't exist, this is fine for login
      console.log('User profile not found in database, will need to be created');
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          $id: user.$id,
          name: user.name,
          email: user.email,
          emailVerification: user.emailVerification,
          $createdAt: user.$createdAt,
          $updatedAt: user.$updatedAt,
        },
        session: {
          $id: session.$id,
          userId: session.userId,
          expire: session.expire,
          $createdAt: session.$createdAt,
        },
        profile: userProfile,
      },
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific Appwrite errors
    let errorMessage = 'Login failed';
    let statusCode = 500;

    if (error.code === 401) {
      errorMessage = 'Invalid email or password';
      statusCode = 401;
    } else if (error.code === 429) {
      errorMessage = 'Too many login attempts. Please try again later.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || 'LOGIN_ERROR'
      },
      { status: statusCode }
    );
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
