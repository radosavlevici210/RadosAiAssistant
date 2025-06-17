import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ChatMessage } from '@/lib/types';

export function useChat() {
  const [selectedModel, setSelectedModel] = useState<'openai' | 'anthropic'>('openai');
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, model }: { content: string; model: string }) => {
      const response = await apiRequest('POST', '/api/chat/message', { content, model });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async ({ prompt, model }: { prompt: string; model: string }) => {
      const response = await apiRequest('POST', '/api/chat/generate-code', { prompt, model });
      return response.json();
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/chat/clear');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
    },
  });

  const sendMessage = useCallback((content: string) => {
    return sendMessageMutation.mutateAsync({ content, model: selectedModel });
  }, [sendMessageMutation, selectedModel]);

  const generateCode = useCallback((prompt: string) => {
    return generateCodeMutation.mutateAsync({ prompt, model: selectedModel });
  }, [generateCodeMutation, selectedModel]);

  const clearChat = useCallback(() => {
    return clearChatMutation.mutateAsync();
  }, [clearChatMutation]);

  return {
    messages,
    isLoading,
    selectedModel,
    setSelectedModel,
    sendMessage,
    generateCode,
    clearChat,
    isSending: sendMessageMutation.isPending,
    isGeneratingCode: generateCodeMutation.isPending,
    isClearing: clearChatMutation.isPending,
  };
}
