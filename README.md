# Digital Krishi Officer - AI-Based Farmer Query Support System

An AI-powered agricultural advisory system designed specifically for Kerala farmers. This system provides expert farming advice in Malayalam, helping farmers with crop diseases, weather decisions, input management, and more.

## 🌾 Project Overview

The Digital Krishi Officer serves as a "Digital Krishi Officer" that provides instant, accurate, and context-aware agricultural advice to farmers in their native language, primarily Malayalam. It bridges the critical gap between farmers and agricultural expertise through AI technology.

### Key Features

- **Malayalam Language Support**: Native language processing for Kerala farmers
- **Multimodal Input**: Text, voice, and image support for comprehensive queries
- **AI-Powered Responses**: Using Google's Gemini 2.5 Flash Lite model via OpenRouter
- **Crop Disease Detection**: Image analysis for disease identification and treatment
- **Expert Escalation**: Automatic escalation to human experts for complex issues
- **24/7 Availability**: Round-the-clock agricultural support

## 🛠️ Tech Stack

### Frontend

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Database

- **Appwrite** - Backend-as-a-Service for authentication and database
- **Appwrite Database** - NoSQL document database
- **Appwrite Auth** - Email/password authentication

### AI Integration

- **OpenRouter** - AI model routing and management
- **Vercel AI SDK** - Streaming AI responses
- **Google Gemini 2.5 Flash Lite** - Primary AI model for agricultural advice

### State Management

- **Zustand** - Lightweight state management solution

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Appwrite account and project
- OpenRouter API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd iic2025
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your actual values:

   ```env
   # Appwrite Configuration
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=iic-db
   NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID=user
   NEXT_PUBLIC_APPWRITE_THREAD_COLLECTION_ID=thread
   NEXT_PUBLIC_APPWRITE_MESSAGE_COLLECTION_ID=message

   # OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key
   NEXT_PUBLIC_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Digital Krishi Officer
   ```

4. **Set up Appwrite Database**

   Create the following collections in your Appwrite database:

   **User Collection (`user`)**

   - username (string, required, size: 100)
   - location (string, required, size: 200)
   - farmsize (string, size: 60)
   - crop (string array, size: 50)
   - experience (string, size: 100)
   - language (string, size: 100)

   **Thread Collection (`thread`)**

   - userId (string, required, size: 100)
   - title (string, required, size: 256)
   - description (string, size: 500)
   - category (string, size: 100)
   - priority (string, size: 50)
   - status (string, size: 50)
   - tags (string array, size: 50)
   - messageCount (number)
   - lastMessageAt (datetime)

   **Message Collection (`message`)**

   - threadId (string, required, size: 100)
   - userId (string, required, size: 100)
   - content (string, required, size: 20000)
   - role (string, required, size: 50)
   - contentType (string, required, size: 100)
   - attachment (string, size: 500)

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
iic2025/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication pages
│   │   │   └── login/
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   └── chat/                 # Chat streaming endpoints
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                   # React components (to be implemented)
│   ├── services/                     # Zustand stores
│   │   ├── authStore.ts
│   │   └── chatStore.ts
│   ├── utils/                        # Utility functions & configurations
│   │   ├── aiModels/                 # AI model configurations
│   │   ├── appwrite/                 # Appwrite configurations
│   │   ├── openrouter/               # OpenRouter configurations
│   │   └── types/                    # TypeScript type definitions
│   └── hooks/                        # Custom React hooks (to be implemented)
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment variables
└── README.md
```

## 🔧 Configuration

### AI Model Configuration

The system is configured to use Google's Gemini 2.5 Flash Lite model through OpenRouter:

```typescript
const MODELS = {
  "google/gemini-2.5-flash-lite": {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "Google",
    description:
      "Lightweight and fast Gemini model optimized for quick responses and cost-effectiveness",
    contextLength: 1000000,
    inputCost: 0.05,
    outputCost: 0.15,
    capabilities: ["text", "vision", "reasoning", "code", "multimodal"],
    recommended: true,
  },
};
```

### Database Schema

The application uses three main collections:

1. **Users**: Store farmer profiles and preferences
2. **Threads**: Organize conversations by topic
3. **Messages**: Store individual messages in conversations

## 🚀 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Chat

- `POST /api/chat/stream` - Stream AI responses

## 🌟 Key Features Implementation

### Malayalam Language Support

The system is specifically designed for Malayalam-speaking farmers with:

- Native language processing
- Cultural context awareness
- Local farming practice knowledge

### AI-Powered Advisory

- Specialized agricultural prompts
- Context-aware responses
- Crop-specific advice
- Weather-based recommendations

### Multimodal Input (Planned)

- Text queries in Malayalam/English
- Voice message support
- Image upload for crop disease detection
- GPS location for region-specific advice

## 🔄 Development Workflow

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### Development Guidelines

1. **Code Style**: Follow TypeScript and ESLint configurations
2. **Components**: Use functional components with hooks
3. **State Management**: Use Zustand for global state
4. **Styling**: Use Tailwind CSS utility classes
5. **API**: Follow RESTful conventions for API routes

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables are properly set in your deployment platform:

- Appwrite endpoint and credentials
- OpenRouter API key
- Application URLs and configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Kerala farmers and agricultural experts for domain knowledge
- Appwrite team for the excellent BaaS platform
- OpenRouter for AI model access
- Vercel team for the AI SDK and deployment platform

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder (coming soon)

---

**Digital Krishi Officer** - Empowering Kerala farmers with AI-driven agricultural expertise. 🌾
