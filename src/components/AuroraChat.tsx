import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Send, Copy, RotateCcw, Trash2, ChevronDown, Info, Menu, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  model_provider: 'Groq' | 'OpenAI';
  model_name: string;
  system_prompt: string;
  messages: string[];
  allow_search: boolean;
}

const ALLOWED_MODELS = {
  Groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ],
  OpenAI: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ]
};

export default function AuroraChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // Agent Configuration
  const [agentRole, setAgentRole] = useState('');
  const [provider, setProvider] = useState<'Groq' | 'OpenAI'>('Groq');
  const [model, setModel] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [messageWebSearch, setMessageWebSearch] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Reset model when provider changes
    setModel('');
  }, [provider]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !provider || !model) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    try {
      const chatRequest: ChatRequest = {
        model_provider: provider,
        model_name: model,
        system_prompt: agentRole,
        messages: [...messages.map(m => m.content), currentMessage],
        allow_search: messageWebSearch || webSearch
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `This is a simulated response from ${provider} ${model}. In a real implementation, this would be the actual AI response based on your configuration.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateMessage = (messageId: string) => {
    // Implementation for regenerating last message
    console.log('Regenerate message:', messageId);
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const isConfigValid = provider && model;
  const hasRoleWarning = !agentRole.trim();

  return (
    <div className="h-screen flex flex-col bg-background aurora-bg">
      {/* Header */}
      <header className="relative border-b border-border glass-surface">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles 
                  size={24} 
                  className="text-foreground transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,102,196,0.6)]" 
                />
              </div>
              <h1 className="text-xl font-semibold">Aurora Agent</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground">
            <span>Provider: {provider}</span>
            <span>•</span>
            <span>Model: {model || 'None'}</span>
            <span>•</span>
            <span>Search: {webSearch ? 'On' : 'Off'}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        {isGenerating && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 rainbow-progress" />
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "w-80 border-r border-border glass-surface transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full absolute inset-y-0 z-20 lg:relative lg:z-auto"
        )}>
          <div className="h-full overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Agent Role */}
              <div className="space-y-2">
                <Label htmlFor="agent-role" className="text-sm font-medium">
                  Agent Role
                </Label>
                <Textarea
                  id="agent-role"
                  placeholder="Define the role, goals, guardrails..."
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value)}
                  className="min-h-[100px] focus-rainbow bg-input border-border"
                  rows={4}
                />
                {hasRoleWarning && (
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Define a role for better responses.
                  </p>
                )}
              </div>

              {/* Provider Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Provider</Label>
                <div className="segmented-control">
                  <div className="flex">
                    {(['Groq', 'OpenAI'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setProvider(p)}
                        className={cn(
                          "segmented-option flex-1 text-sm font-medium",
                          provider === p && "active"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Model</Label>
                <Select 
                  value={model} 
                  onValueChange={setModel}
                  disabled={!provider}
                >
                  <SelectTrigger className="focus-rainbow bg-input border-border">
                    <SelectValue placeholder="Select a model..." />
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-border">
                    {ALLOWED_MODELS[provider]?.map((modelName) => (
                      <SelectItem key={modelName} value={modelName}>
                        {modelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isConfigValid && (
                  <p className="text-xs text-destructive">
                    Provider and model are required
                  </p>
                )}
              </div>

              {/* Web Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="web-search" className="text-sm font-medium">
                    Enable Web Search
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} className="text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Uses Tavily to fetch live results</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="web-search"
                  checked={webSearch}
                  onCheckedChange={setWebSearch}
                />
              </div>

              {/* Advanced Settings */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium">
                    Advanced
                    <ChevronDown size={16} className={cn(
                      "transition-transform duration-200",
                      advancedOpen && "rotate-180"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Temperature: {temperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Max Tokens</Label>
                    <Input
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      min="1"
                      max="4000"
                      className="focus-rainbow bg-input border-border"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Apply Button */}
              <Button 
                className="w-full btn-rainbow"
                disabled={!isConfigValid}
              >
                <Settings size={16} className="mr-2" />
                Save & Apply
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Chat */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-full aurora-bg flex items-center justify-center">
                    <Sparkles size={24} className="text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">Ready to Chat</h2>
                  <p className="text-muted-foreground">
                    Configure your agent in the sidebar and start a conversation
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex group",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "relative",
                        message.role === 'user' ? "message-user" : "message-agent"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Message Actions */}
                      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg glass-surface">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy size={12} />
                          </Button>
                          {message.role === 'agent' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => regenerateMessage(message.id)}
                            >
                              <RotateCcw size={12} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="message-agent">
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-6 glass-surface">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Message Web Search Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="message-search"
                    checked={messageWebSearch}
                    onCheckedChange={setMessageWebSearch}
                  />
                  <Label htmlFor="message-search" className="text-sm text-muted-foreground">
                    Web search for this message
                  </Label>
                </div>
              </div>

              {/* Input */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask anything..."
                    className="min-h-[60px] max-h-[200px] resize-none focus-rainbow bg-input border-border"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || !isConfigValid || isGenerating}
                  className="btn-rainbow px-6 py-3 h-auto"
                >
                  <Send size={18} className="mr-2" />
                  {isGenerating ? 'Generating...' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}