'use client';

import { useState } from 'react';
import { Copy, Check, User, Bot, Image, FileText, Mic } from 'lucide-react';
import { ChatMessage } from '@/utils/types/chat.types';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  isCurrentUser: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isUser, isCurrentUser, showAvatar }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const getContentTypeIcon = () => {
    switch (message.contentType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'voice':
        return <Mic className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (message.contentType) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.attachment && (
              <img
                src={message.attachment}
                alt="Uploaded image"
                className="max-w-sm rounded-lg"
              />
            )}
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        );
      case 'voice':
        return (
          <div className="space-y-2">
            {message.attachment && (
              <audio controls className="max-w-sm">
                <source src={message.attachment} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="space-y-2">
            {message.attachment && (
              <a
                href={message.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                <span>View attachment</span>
              </a>
            )}
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        );
      default:
        return (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        );
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        {showAvatar && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary text-primary-foreground ml-2' : 'bg-secondary text-secondary-foreground mr-2'
          }`}>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className={`relative ${showAvatar ? '' : isUser ? 'mr-10' : 'ml-10'}`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-muted-foreground rounded-bl-md'
            }`}
          >
            {/* Content type indicator */}
            {message.contentType !== 'text' && (
              <div className="flex items-center space-x-1 mb-2 opacity-70">
                {getContentTypeIcon()}
                <span className="text-xs capitalize">{message.contentType}</span>
              </div>
            )}

            {/* Message content */}
            <div className="text-sm">
              {renderContent()}
            </div>
          </div>

          {/* Message metadata */}
          <div className={`flex items-center space-x-2 mt-1 text-xs text-muted-foreground ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <span>
              {message.$createdAt 
                ? formatDistanceToNow(new Date(message.$createdAt), { addSuffix: true })
                : 'Just now'
              }
            </span>
            
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-opacity"
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
