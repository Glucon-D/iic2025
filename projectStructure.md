# Project Structure - AI-Based Farmer Query Support System

## 🛠️ Tech Stack

### Frontend Framework

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework for styling

### Backend & Database

- **Appwrite** - Backend-as-a-Service for authentication and database
- **Appwrite Database** - NoSQL document database for data storage
- **Appwrite Auth** - Email/password authentication system

### AI Integration

- **OpenRouter** - AI model routing and management
- **Vercel AI SDK** - Streaming AI responses and model integration
- **Multiple AI Models** - Support for various LLMs through OpenRouter

### State Management

- **Zustand** - Lightweight state management solution

### Additional Tools

- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting

---

## 📁 Project File Structure

```
iic2025/
├── public/
│   ├── icons/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx
│   │   │   ├── [threadId]/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts
│   │   │   │   └── logout/
│   │   │   │       └── route.ts
│   │   │   ├── chat/
│   │   │   │   ├── stream/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── threads/
│   │   │   │   │   └── route.ts
│   │   │   │   └── messages/
│   │   │   │       └── route.ts
│   │   │   ├── user/
│   │   │   │   ├── profile/
│   │   │   │   │   └── route.ts
│   │   │   │   └── preferences/
│   │   │   │       └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── components/                   # Page Components
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── ThreadList.tsx
│   │   │   ├── VoiceInput.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ProtectedRoute.tsx
│   ├── ui/                          # Reusable UI Components
│   │   ├── buttons/
│   │   │   ├── Button.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── FloatingActionButton.tsx
│   │   ├── inputs/
│   │   │   ├── Input.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Select.tsx
│   │   │   └── FileInput.tsx
│   │   ├── dropdown/
│   │   │   ├── Dropdown.tsx
│   │   │   └── DropdownMenu.tsx
│   │   ├── modals/
│   │   │   ├── Modal.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── cards/
│   │   │   ├── Card.tsx
│   │   │   └── MessageCard.tsx
│   │   ├── navigation/
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── Pagination.tsx
│   │   └── feedback/
│   │       ├── Toast.tsx
│   │       ├── Alert.tsx
│   │       └── ProgressBar.tsx
│   ├── services/                    # State Management (Zustand)
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   ├── userStore.ts
│   │   ├── threadStore.ts
│   │   └── uiStore.ts
│   ├── utils/                       # Utility Functions & Configurations
│   │   ├── appwrite/
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   ├── database.ts
│   │   │   └── storage.ts
│   │   ├── openrouter/
│   │   │   ├── config.ts
│   │   │   ├── client.ts
│   │   │   └── streaming.ts
│   │   ├── aiModels/
│   │   │   ├── modelConfig.ts
│   │   │   ├── modelTypes.ts
│   │   │   └── modelSelector.ts
│   │   ├── helpers/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── constants.ts
│   │   │   └── dateUtils.ts
│   │   └── types/
│   │       ├── auth.types.ts
│   │       ├── chat.types.ts
│   │       ├── user.types.ts
│   │       └── api.types.ts
│   └── hooks/                       # Custom React Hooks
│       ├── useAuth.ts
│       ├── useChat.ts
│       ├── useLocalStorage.ts
│       └── useDebounce.ts
├── .env.local                       # Environment Variables
├── .env.example                     # Environment Variables Template
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── README.md
├── idea.md
└── projectStructure.md
```

---

## 🗄️ Database Schema (Appwrite)

### Collections Overview

- **Database Name**: `iic-db`
- **Collections**: `user`, `thread`, `message`

### 1. User Collection

```typescript
interface User {
  $id: string; // Auto-generated document ID
  username: string; // Required, Size: 100
  location: string; // Required, Size: 200
  farmsize: string; // Size: 60
  crop: string[]; // Array, Size: 50
  experience: string; // Size: 100
  language: string; // Size: 100
  $createdAt: Date; // Auto-generated
  $updatedAt: Date; // Auto-generated
}
```

### 2. Thread Collection

```typescript
interface Thread {
  $id: string; // Auto-generated document ID
  userId: string; // Required, Size: 100 (Foreign Key)
  title: string; // Required, Size: 256
  description: string; // Size: 500
  category: string; // Size: 100
  priority: string; // Size: 50
  status: string; // Size: 50
  tags: string[]; // Array, Size: 50
  messageCount: number; // Number field
  lastMessageAt: Date; // Date field
  $createdAt: Date; // Auto-generated
  $updatedAt: Date; // Auto-generated
}
```

### 3. Message Collection

```typescript
interface Message {
  $id: string; // Auto-generated document ID
  threadId: string; // Required, Size: 100 (Foreign Key)
  userId: string; // Required, Size: 100 (Foreign Key)
  content: string; // Required, Size: 20000
  role: string; // Required, Size: 50 (user, assistant, system)
  contentType: string; // Required, Size: 100 (text, image, voice, file)
  attachment: string; // Size: 500 (file URLs, image URLs, etc.)
  $createdAt: Date; // Auto-generated
  $updatedAt: Date; // Auto-generated
}
```

---

## 🔧 Key Configuration Files

### Environment Variables (.env.local)

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

### AI Models Configuration (src/utils/aiModels/modelConfig.ts)

```typescript
export const AI_MODELS = {
  // Primary Malayalam Models
  MALAYALAM_CHAT: "anthropic/claude-3-haiku",
  MALAYALAM_TRANSLATION: "google/gemma-7b-it",

  // Agricultural Specialized Models
  AGRICULTURE_EXPERT: "openai/gpt-4-turbo",
  CROP_DISEASE_DETECTION: "anthropic/claude-3-sonnet",

  // General Purpose Models
  GENERAL_CHAT: "openai/gpt-3.5-turbo",
  FAST_RESPONSE: "anthropic/claude-3-haiku",

  // Image Analysis Models
  IMAGE_ANALYSIS: "openai/gpt-4-vision-preview",
  CROP_IMAGE_DETECTION: "google/gemini-pro-vision",
};
```

---

## 🚀 Key Features Implementation

### Authentication (Appwrite)

- Email/password authentication
- User session management
- Protected routes
- User profile management

### AI Integration (OpenRouter + Vercel AI SDK)

- Streaming responses using `streamText`
- Multiple AI model support
- Context-aware conversations
- Malayalam language processing

### Real-time Chat

- Thread-based conversations
- Message history
- Voice input support
- Image upload and analysis

### State Management (Zustand)

- Authentication state
- Chat state and message history
- User preferences
- UI state management

---

## 📦 Key Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "appwrite": "^13.0.0",
    "@openrouter/ai-sdk-provider": "^0.0.1",
    "ai": "^3.0.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.263.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🔌 API Integration Examples

### OpenRouter Integration (src/utils/openrouter/client.ts)

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.NEXT_PUBLIC_OPENROUTER_BASE_URL,
});

export async function generateAIResponse(
  messages: Array<{ role: string; content: string }>,
  model: string = "anthropic/claude-3-haiku"
) {
  const result = await streamText({
    model: openrouter(model),
    messages,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return result;
}
```

### Appwrite Authentication (src/utils/appwrite/auth.ts)

```typescript
import { Client, Account, ID } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);

export const authService = {
  // Email/Password Registration
  async createAccount(email: string, password: string, name: string) {
    try {
      const userAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      return userAccount;
    } catch (error) {
      throw error;
    }
  },

  // Email/Password Login
  async login(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  },

  // Get Current User
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  // Logout
  async logout() {
    try {
      return await account.deleteSessions();
    } catch (error) {
      throw error;
    }
  },
};
```

---

## 🏗️ Development Workflow

### 1. Setup Commands

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start
```

### 2. Code Quality

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run type-check
```

### 3. Database Setup (Appwrite)

1. Create Appwrite project
2. Setup database collections (user, thread, message)
3. Configure authentication settings
4. Set up storage buckets for file uploads

---

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env.local` to version control
- Use different API keys for development and production
- Implement proper CORS settings in Appwrite

### Authentication

- Implement proper session management
- Use protected routes for sensitive pages
- Validate user permissions on server-side

### Data Validation

- Validate all user inputs
- Sanitize data before database operations
- Implement rate limiting for API endpoints

---

## 🚀 Deployment Strategy

### Vercel Deployment (Recommended)

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Enable automatic deployments on push to main branch

### Environment Configuration

- **Development**: Local Appwrite instance or cloud
- **Staging**: Appwrite cloud with staging database
- **Production**: Appwrite cloud with production database

---

## 📱 Mobile Responsiveness

### Responsive Design Approach

- Mobile-first design using Tailwind CSS
- Progressive Web App (PWA) capabilities
- Touch-friendly interface for farmers
- Offline functionality for basic features

### Key Mobile Features

- Voice input for Malayalam queries
- Camera integration for crop image capture
- GPS location detection
- Push notifications for important updates

---

This structure provides a scalable foundation for the Digital Krishi Officer system with clear separation of concerns, modern development practices, and comprehensive documentation for team collaboration.
