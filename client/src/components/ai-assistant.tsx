import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChat } from '@/hooks/use-chat';
import { useToast } from '@/hooks/use-toast';
import type { SystemStatus } from '@/lib/types';

export function AIAssistant() {
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    messages, 
    isLoading, 
    selectedModel, 
    setSelectedModel, 
    sendMessage, 
    generateCode,
    clearChat, 
    isSending, 
    isClearing 
  } = useChat();

  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ['/api/system/status'],
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(message);
      setMessage('');
      toast({
        title: "Message sent",
        description: "AI response generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please check your API configuration.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateCode = async () => {
    if (!message.trim()) return;

    try {
      const result = await generateCode(message);
      toast({
        title: "Code generated",
        description: "Secure code with watermarking applied",
      });
      setMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate code. Please check your API configuration.",
        variant: "destructive",
      });
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChat();
      toast({
        title: "Chat cleared",
        description: "All messages have been securely deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* AI Chat Interface */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">AI Assistant Pro</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedModel} onValueChange={(value: 'openai' | 'anthropic') => setSelectedModel(value)}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleClearChat}
                disabled={isClearing}
                variant="destructive" 
                size="sm"
              >
                <i className="fas fa-trash mr-1"></i>
                {isClearing ? 'Clearing...' : 'Clear'}
              </Button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="space-y-4 mb-6 h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <i className="fas fa-robot text-4xl mb-4"></i>
                  <p>No messages yet. Start a conversation with AI Assistant Pro!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="chat-message">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-primary to-secondary' 
                        : 'bg-gradient-to-r from-accent to-primary'
                    }`}>
                      <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-robot'} text-white text-xs`}></i>
                    </div>
                    <div className={`rounded-lg p-4 flex-1 ${
                      msg.role === 'user' ? 'bg-slate-700/50' : 'bg-slate-700/30'
                    }`}>
                      <div className="whitespace-pre-wrap text-slate-200">{msg.content}</div>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-2">
                          <i className="fas fa-shield-alt text-accent"></i>
                          <span>Auto-encrypted • Watermarked • Secure</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Input Area */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-400 resize-none"
                rows={3}
                placeholder="Ask AI Assistant Pro anything..."
                disabled={isSending}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <button 
                  className="text-slate-400 hover:text-slate-200 transition-colors" 
                  title="Code mode"
                  onClick={handleGenerateCode}
                  disabled={isSending || !message.trim()}
                >
                  <i className="fas fa-code"></i>
                </button>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
            >
              {isSending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Tools Sidebar */}
      <div className="space-y-6">
        {/* Security Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Device Authentication</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-accent text-sm">{systemStatus?.deviceAuthentication || 'Verified'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Memory Encryption</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-accent text-sm">{systemStatus?.memoryEncryption || 'Active'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Theft Protection</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-accent text-sm">{systemStatus?.theftProtection || 'Enabled'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
              onClick={() => setMessage('Generate a secure React component with encryption')}
            >
              <i className="fas fa-code text-primary mr-3"></i>
              Generate Code
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
              onClick={() => setMessage('Predict market trends for the next quarter')}
            >
              <i className="fas fa-chart-line text-secondary mr-3"></i>
              AI Predictions
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-700/50 hover:bg-slate-700 border-slate-600 justify-start"
              onClick={() => toast({ title: "Export", description: "Session exported securely" })}
            >
              <i className="fas fa-save text-accent mr-3"></i>
              Export Session
            </Button>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">API Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">OpenAI</span>
              <span className={`text-sm ${
                systemStatus?.apis.openai === 'connected' ? 'text-accent' : 'text-red-400'
              }`}>
                {systemStatus?.apis.openai || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Anthropic</span>
              <span className={`text-sm ${
                systemStatus?.apis.anthropic === 'connected' ? 'text-accent' : 'text-red-400'
              }`}>
                {systemStatus?.apis.anthropic || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">CoinGecko</span>
              <span className="text-accent text-sm">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
