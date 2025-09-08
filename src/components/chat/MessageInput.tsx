"use client";

import { useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Image,
  Mic,
  X,
  Loader2,
  MicOff,
  AlertCircle,
} from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface MessageInputProps {
  onSendMessage: (
    content: string,
    contentType?: "text" | "image" | "voice" | "file",
    attachment?: File
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function MessageInput({
  onSendMessage,
  disabled,
  placeholder,
  value,
  onChange,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMessage = value !== undefined ? value : message;

  const {
    isRecording,
    isProcessing,
    error: voiceError,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useVoiceRecording();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((currentMessage.trim() || attachedFile) && !disabled) {
      const content =
        currentMessage.trim() ||
        (attachedFile ? `Image: ${attachedFile.name}` : "");
      let contentType: "text" | "image" | "voice" | "file" = "text";

      if (attachedFile) {
        if (attachedFile.type.startsWith("image/")) {
          contentType = "image";
        } else if (attachedFile.type.startsWith("audio/")) {
          contentType = "voice";
        } else {
          contentType = "file";
        }
      }

      onSendMessage(content, contentType, attachedFile || undefined);
      if (onChange) {
        onChange("");
      } else {
        setMessage("");
      }
      setAttachedFile(null);
      setImagePreview(null);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setMessage(newValue);
    }

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type for images
      const validImageTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        alert(
          "Please select a valid image file (PNG, JPEG, JPG, GIF, or WebP)"
        );
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size must be less than 10MB");
        return;
      }

      setAttachedFile(file);

      // Create preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording and process
      try {
        const audioBlob = await stopRecording();
        if (audioBlob) {
          await transcribeAudio(audioBlob);
        }
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    } else {
      // Start recording
      clearError();
      await startRecording();
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to transcribe audio");
      }

      const result = await response.json();

      // Add transcribed text to the message input
      if (result.text) {
        const transcribedText = result.text.trim();
        const newText = currentMessage
          ? `${currentMessage} ${transcribedText}`
          : transcribedText;
        if (onChange) {
          onChange(newText);
        } else {
          setMessage(newText);
        }

        // Auto-resize textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
      }
    } catch (error) {
      console.error("Transcription failed:", error);
      // The error will be shown via the voice recording hook
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {/* File attachment preview */}
      {attachedFile && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-accent rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {attachedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeAttachment}
              className="p-1 hover:bg-accent rounded transition-colors ml-2"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
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
          onClick={handleVoiceRecording}
          disabled={disabled || isTranscribing}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            isRecording
              ? "text-red-500 bg-red-50 dark:bg-red-950"
              : isProcessing || isTranscribing
              ? "text-blue-500 bg-blue-50 dark:bg-blue-950"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          title={
            isRecording
              ? "Stop recording"
              : isProcessing
              ? "Processing..."
              : isTranscribing
              ? "Transcribing..."
              : "Record voice message"
          }
        >
          {isProcessing || isTranscribing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-5 w-5 animate-pulse" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={currentMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder || "Type your message..."}
            disabled={disabled}
            className="w-full px-4 py-3 bg-muted border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 min-h-[48px] max-h-[120px]"
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!currentMessage.trim() && !attachedFile)}
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

      {/* Recording/Processing indicators */}
      {(isRecording || isProcessing || isTranscribing) && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isRecording && (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-500">
                  Recording... {recordingDuration}s
                </span>
              </>
            )}
            {isProcessing && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-500">
                  Processing audio...
                </span>
              </>
            )}
            {isTranscribing && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-500">
                  Converting speech to text...
                </span>
              </>
            )}
          </div>

          {isRecording && (
            <button
              type="button"
              onClick={cancelRecording}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Error display */}
      {voiceError && (
        <div className="mt-2 flex items-center space-x-2 text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{voiceError}</span>
          <button
            type="button"
            onClick={clearError}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
