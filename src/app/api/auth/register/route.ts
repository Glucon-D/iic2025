import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/utils/appwrite/auth';
import { databaseService } from '@/utils/appwrite/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, profile } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Create user account
    const user = await authService.createAccount({ 
      email: email.toLowerCase().trim(), 
      password, 
      name: name.trim() 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user profile in database if profile data is provided
    let userProfile = null;
    if (profile && profile.username && profile.location) {
      try {
        const profileData = {
          userId: user.$id,
          username: profile.username.trim(),
          location: profile.location.trim(),
          farmsize: profile.farmsize || '',
          crop: profile.crop || [],
          experience: profile.experience || '',
          language: profile.language || 'malayalam',
        };

        userProfile = await databaseService.createUser(profileData);
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail registration if profile creation fails
        // User can complete profile later
      }
    }

    // Get current session
    const sessions = await authService.getSessions();
    const currentSession = sessions.sessions[0]; // Most recent session

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
        session: currentSession ? {
          $id: currentSession.$id,
          userId: currentSession.userId,
          expire: currentSession.expire,
          $createdAt: currentSession.$createdAt,
        } : null,
        profile: userProfile,
      },
      message: 'Registration successful'
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific Appwrite errors
    let errorMessage = 'Registration failed';
    let statusCode = 500;

    if (error.code === 409) {
      errorMessage = 'An account with this email already exists';
      statusCode = 409;
    } else if (error.code === 400) {
      errorMessage = 'Invalid registration data';
      statusCode = 400;
    } else if (error.code === 429) {
      errorMessage = 'Too many registration attempts. Please try again later.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        code: error.code || 'REGISTRATION_ERROR'
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
