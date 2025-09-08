'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/utils/types/chat.types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  isStreaming?: boolean;
}

export function MessageList({ messages, currentUserId, isStreaming }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Start a conversation
          </h3>
          <p className="text-muted-foreground">
            Ask me anything about farming, crops, diseases, weather, or any agricultural question. 
            I'm here to help you with expert advice in your preferred language.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isCurrentUser = message.userId === currentUserId;
         const showAvatar = index === 0 || messages[index - 1].role !== message.role;
         const isLastMessage = index === messages.length - 1;
         const isStreamingMessage = isStreaming && !isUser && isLastMessage;
         
         return (
           <MessageBubble
             key={message.$id || index}
             message={message}
             isUser={isUser}
             isCurrentUser={isCurrentUser}
             showAvatar={showAvatar}
             isStreaming={isStreamingMessage}
           />
         );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
