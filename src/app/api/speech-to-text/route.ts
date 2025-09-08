import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB as per OpenAI limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }
    
    // Check for minimum file size (very small files often have poor quality)
    const minSize = 1024; // 1KB
    if (audioFile.size < minSize) {
      return NextResponse.json(
        { error: 'Audio file too small. Minimum size is 1KB.' },
        { status: 400 }
      );
    }

    // Validate file type - OpenAI supports these formats
    const allowedTypes = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/flac',
      'audio/mp3', // Additional common format
      'audio/x-m4a' // Alternative m4a MIME type
    ];

    const isValidType = allowedTypes.some(type => 
      audioFile.type === type || 
      audioFile.type.includes(type.split('/')[1]) ||
      audioFile.name.toLowerCase().endsWith(`.${type.split('/')[1]}`)
    );

    if (!isValidType) {
      return NextResponse.json(
        { error: `Unsupported audio format. Supported formats: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare form data for OpenAI API
    const openaiFormData = new FormData();
    
    // Convert the file to a proper format for OpenAI
    // OpenAI expects specific file extensions, so we'll rename based on MIME type
    let fileName = 'audio.webm';
    if (audioFile.type.includes('mp4')) fileName = 'audio.mp4';
    else if (audioFile.type.includes('wav')) fileName = 'audio.wav';
    else if (audioFile.type.includes('ogg')) fileName = 'audio.ogg';
    else if (audioFile.type.includes('mpeg')) fileName = 'audio.mp3';
    else if (audioFile.type.includes('m4a')) fileName = 'audio.m4a';
    else if (audioFile.type.includes('flac')) fileName = 'audio.flac';

    // Create a new File object with the correct name
    const renamedFile = new File([audioFile], fileName, { type: audioFile.type });
    
    openaiFormData.append('file', renamedFile);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('response_format', 'verbose_json');
    
    // Temperature for more deterministic output (better quality)
    openaiFormData.append('temperature', '0.2');
    
    // Optional: Add language hint if provided
    const language = formData.get('language') as string;
    if (language) {
      openaiFormData.append('language', language);
    }
    
    // Optional: Add prompt for context and consistency
    const prompt = formData.get('prompt') as string;
    if (prompt) {
      openaiFormData.append('prompt', prompt);
    } else {
      // Default prompt for better punctuation and formatting
      openaiFormData.append('prompt', 'This is a clear audio recording. Please provide accurate transcription with proper punctuation and formatting.');
    }
    
    // Optional: Add timestamp granularities for better accuracy
    const timestamp_granularities = formData.get('timestamp_granularities') as string;
    if (timestamp_granularities) {
      openaiFormData.append('timestamp_granularities[]', timestamp_granularities);
    }

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      
      let errorMessage = 'Speech-to-text conversion failed';
      if (response.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (response.status === 413) {
        errorMessage = 'Audio file too large';
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Validate response
    if (!result.text) {
      return NextResponse.json(
        { error: 'No transcription received' },
        { status: 500 }
      );
    }

    // Return the transcribed text with enhanced metadata
    return NextResponse.json({
      text: result.text.trim(),
      language: result.language || 'unknown',
      duration: result.duration || null,
      segments: result.segments || null,
      words: result.words || null,
    });

  } catch (error) {
    console.error('Speech-to-text API error:', error);
    
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
