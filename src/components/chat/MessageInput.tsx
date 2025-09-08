'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, Image, Mic, X, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, contentType?: 'text' | 'image' | 'voice' | 'file') => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSendMessage, disabled, placeholder }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFile) && !disabled) {
      const content = message.trim();
      let contentType: 'text' | 'image' | 'voice' | 'file' = 'text';
      
      if (attachedFile) {
        if (attachedFile.type.startsWith('image/')) {
          contentType = 'image';
        } else if (attachedFile.type.startsWith('audio/')) {
          contentType = 'voice';
        } else {
          contentType = 'file';
        }
      }
      
      onSendMessage(content, contentType);
      setMessage('');
      setAttachedFile(null);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = () => {
    // TODO: Implement voice recording
    setIsRecording(true);
    console.log('Voice recording not implemented yet');
  };

  const stopRecording = () => {
    setIsRecording(false);
    // TODO: Process recorded audio
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {/* File attachment preview */}
      {attachedFile && (
        <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {attachedFile.type.startsWith('image/') ? (
              <Image className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground truncate">
              {attachedFile.name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({(attachedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={removeAttachment}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Voice recording button */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            isRecording
              ? 'text-red-500 bg-red-50 dark:bg-red-950'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          title={isRecording ? 'Stop recording' : 'Record voice message'}
        >
          <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder || 'Type your message...'}
            disabled={disabled}
            className="w-full px-4 py-3 bg-muted border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 min-h-[48px] max-h-[120px]"
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && !attachedFile)}
          className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center space-x-2 text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm">Recording...</span>
        </div>
      )}
    </div>
  );
}
