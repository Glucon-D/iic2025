# Image Upload Implementation

## Overview
Implemented complete image upload functionality for the chat application using Appwrite buckets for storage. The system supports uploading PNG, JPEG, JPG, GIF, and WebP images up to 10MB in size.

## Key Features
- Image file validation (type and size)
- Real-time image preview before sending
- Appwrite bucket integration for storage
- Image URL storage in message attachment field
- Support for image content in OpenRouter API calls
- Image display in chat messages

## Components Modified

### 1. Storage Service (`src/utils/appwrite/storage.ts`)
- Created new storage service for handling image uploads
- Validates file type and size
- Uploads files to Appwrite bucket
- Returns public URL for uploaded images

### 2. MessageInput Component (`src/components/chat/MessageInput.tsx`)
- Added image preview functionality
- File type validation for images only
- File size validation (max 10MB)
- Pass attachment file to parent component

### 3. Chat Store (`src/services/chatStore.ts`)
- Updated `sendMessage` to accept file attachment
- Uploads image to Appwrite before saving message
- Stores image URL in message attachment field
- Formats messages with images for OpenRouter API

### 4. API Route (`src/app/api/generateResponse/route.ts`)
- Updated to handle messages with image content
- Supports OpenRouter's image URL format
- Uses Gemini 2.0 Flash model with vision capabilities

### 5. MessageBubble Component (`src/components/chat/MessageBubble.tsx`)
- Already had support for displaying images
- Shows images from attachment URLs

### 6. Chat Pages
- Updated to pass attachment parameter through sendMessage

## Technical Details

### Appwrite Bucket Configuration
- Bucket ID: `iic-bucket`
- Public access enabled for files
- No authentication required for viewing images

### Image Message Format for OpenRouter
```javascript
{
  role: "user",
  content: [
    {
      type: "text",
      text: "What's in this image?"
    },
    {
      type: "image_url",
      image_url: {
        url: "https://appwrite-bucket-url/image.jpg"
      }
    }
  ]
}
```

### Supported Image Types
- PNG (image/png)
- JPEG (image/jpeg)
- JPG (image/jpg)
- GIF (image/gif)
- WebP (image/webp)

### File Size Limit
- Maximum: 10MB per image

## Usage Flow
1. User clicks attachment button in message input
2. Selects an image file from device
3. Image preview is shown with file details
4. User can add optional text message
5. On send, image is uploaded to Appwrite
6. Message is saved with image URL in attachment field
7. Image URL is included in OpenRouter API call
8. Assistant can analyze and respond about the image
9. Image is displayed in chat conversation

## Error Handling
- Invalid file type alert
- File size exceeded alert
- Upload failure error messages
- Graceful fallback for failed uploads

## Future Enhancements
- Support for multiple images per message
- Image compression before upload
- Support for other file types (PDFs, documents)
- Progress indicator for large uploads
- Image editing/cropping before sending