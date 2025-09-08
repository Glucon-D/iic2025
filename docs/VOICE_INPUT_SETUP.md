# Voice Input Implementation

This document explains the voice input functionality implemented in the Digital Krishi Officer chat interface.

## Overview

The voice input feature allows users to record audio messages that are automatically converted to text using OpenAI's Whisper API. The implementation includes:

- **Cross-browser compatibility**: Uses MediaRecorder API which works in all modern browsers
- **Permission handling**: Properly requests and handles microphone permissions
- **Error handling**: Comprehensive error handling for network, API, and permission issues
- **Audio processing**: Converts recorded audio blob to proper format for OpenAI Whisper
- **Visual feedback**: Shows recording/processing states to users
- **Security**: Uses environment variables for API keys and validates inputs

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```env
# OpenAI Configuration (for voice input)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
pnpm dev
```

## How It Works

### User Flow

1. **Click microphone button**: User clicks the microphone icon in the chat input
2. **Permission request**: Browser requests microphone permission (first time only)
3. **Recording starts**: Audio recording begins with visual feedback
4. **Stop recording**: User clicks the microphone button again to stop
5. **Processing**: Audio is processed and sent to OpenAI Whisper API
6. **Transcription**: Speech is converted to text and added to the input field
7. **Send message**: User can edit the text and send the message normally

### Technical Implementation

#### Files Created/Modified

1. **`src/hooks/useVoiceRecording.ts`** - Custom hook for voice recording
   - Handles MediaRecorder API
   - Manages recording states
   - Provides error handling and cleanup

2. **`src/app/api/speech-to-text/route.ts`** - API endpoint for transcription
   - Receives audio blobs from frontend
   - Converts audio to OpenAI-compatible format
   - Calls OpenAI Whisper API
   - Returns transcribed text

3. **`src/components/chat/MessageInput.tsx`** - Updated chat input component
   - Integrates voice recording hook
   - Handles transcription workflow
   - Provides visual feedback

## Browser Compatibility

### Supported Browsers
- Chrome 47+
- Firefox 25+
- Safari 14+
- Edge 79+

### Audio Formats
The implementation automatically selects the best supported audio format:
1. `audio/webm;codecs=opus` (preferred)
2. `audio/webm`
3. `audio/mp4`
4. `audio/ogg;codecs=opus`
5. `audio/wav` (fallback)

## Error Handling

### Common Errors and Solutions

1. **"Microphone permission denied"**
   - User needs to allow microphone access in browser
   - Check browser settings for site permissions

2. **"No microphone found"**
   - Ensure microphone is connected and working
   - Check system audio settings

3. **"Voice recording is not supported"**
   - Browser doesn't support MediaRecorder API
   - Upgrade to a modern browser

4. **"OpenAI API key not configured"**
   - Add OPENAI_API_KEY to environment variables
   - Restart the development server

5. **"Audio file too large"**
   - Recording is longer than 25MB limit
   - Keep recordings under a few minutes

## Security Considerations

- API keys are stored securely in environment variables
- Audio data is only sent to OpenAI's secure API
- No audio data is stored on the server
- File size and type validation prevents abuse

## Cost Considerations

OpenAI Whisper API pricing (as of 2024):
- $0.006 per minute of audio
- Very cost-effective for typical usage
- Consider implementing usage limits for production

## Troubleshooting

### Development Issues

1. **Environment variable not loaded**
   ```bash
   # Restart development server
   pnpm dev
   ```

2. **TypeScript errors**
   ```bash
   # Check for missing dependencies
   pnpm install
   ```

3. **API endpoint not found**
   - Ensure the API route file is in the correct location
   - Check Next.js routing configuration

### Production Deployment

1. **Environment variables**
   - Ensure OPENAI_API_KEY is set in production environment
   - Verify environment variable names match exactly

2. **HTTPS requirement**
   - MediaRecorder API requires HTTPS in production
   - Ensure your deployment uses SSL certificates

## Future Enhancements

Potential improvements for the voice input feature:

1. **Language detection**: Automatically detect spoken language
2. **Voice commands**: Support for voice-activated commands
3. **Audio playback**: Allow users to review recordings before transcription
4. **Offline support**: Local speech recognition for basic functionality
5. **Custom wake words**: Voice activation without button press
