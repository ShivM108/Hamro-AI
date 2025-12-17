import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, StopCircle, ChevronDown, MoreHorizontal, Trash2, Download, Settings, HelpCircle } from 'lucide-react';
import { Message, LoadingState } from '../types';
import { sendMessage, AVAILABLE_MODELS } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

// Custom Himalayan Brand Logo
const HamroLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15.5 8.5L21.5 21.5H13L15.5 8.5Z" fill="currentColor" fillOpacity="0.4" />
    <path d="M10.5 2.5L2.5 21.5H18L10.5 2.5Z" fill="currentColor" />
    <path d="M10.5 2.5L13.2 8.5H7.8L10.5 2.5Z" fill="white" />
  </svg>
);

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'intro',
        role: 'model',
        content: "Hi! Buddy, I'm Hamro AI. Ask me to write, edit, or answer questions directly on your pages.",
        timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingState]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || loadingState !== LoadingState.IDLE) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoadingState(LoadingState.THINKING);

    try {
      // Pass the selected model to the service
      const responseText = await sendMessage(userMsg.content, selectedModel);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an error while processing your request. Please check your API Key configuration or try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleClearChat = () => {
    setMessages([{
        id: 'intro',
        role: 'model',
        content: "Hi Buddy, I'm Hamro AI. Ask me to write, edit, or answer questions directly on your pages.",
        timestamp: new Date()
    }]);
    setIsHeaderMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-12 border-b border-[#e9e9e7] flex items-center px-4 justify-between sticky top-0 bg-white z-10 lg:pl-4 pl-14 transition-all">
        <div className="flex items-center gap-2">
            <HamroLogo className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-sm text-[#37352f]">Hamro <span>AI</span></span>
        </div>
        
        <div className="flex items-center gap-2 relative">
            <span className="hidden sm:inline-block text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wide">Beta</span>
            
            {/* Three Dot Menu */}
            <div className="relative">
                <button 
                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                    className={`
                        flex items-center justify-center rounded-md transition-colors 
                        text-[#37352f] hover:bg-[#efefed] active:bg-[#e0e0de]
                        ${isHeaderMenuOpen ? 'bg-[#efefed]' : ''}
                        /* Mobile: Larger touch target */
                        h-9 w-9 
                        /* Desktop: Compact */
                        sm:h-8 sm:w-8
                    `}
                    aria-label="More options"
                >
                    <MoreHorizontal className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>

                {isHeaderMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsHeaderMenuOpen(false)} />
                        <div className={`
                            absolute right-0 top-full z-50 flex flex-col bg-white border border-[#e9e9e7] 
                            shadow-[0_16px_36px_rgba(0,0,0,0.12)] 
                            animate-in fade-in zoom-in-95 duration-100 ease-out origin-top-right
                            
                            /* Mobile Styles: Wider, more padding, larger radius */
                            mt-2 w-[85vw] max-w-[300px] rounded-xl py-2
                            
                            /* Tablet/Desktop Styles: Compact, tighter padding */
                            sm:w-64 sm:rounded-lg sm:py-1.5
                        `}>
                             <div className="px-4 py-2 sm:px-3 sm:py-1.5 border-b border-[#e9e9e7] mb-1">
                                <p className="text-xs sm:text-[11px] font-medium text-[#9b9a97] uppercase tracking-wider">Chat Options</p>
                             </div>
                             
                             <button 
                                onClick={handleClearChat}
                                className={`
                                    flex items-center text-left text-[#37352f] 
                                    hover:bg-[#efefed] active:bg-[#e9e9e7]
                                    rounded-lg sm:rounded-md transition-colors group mx-1.5
                                    /* Mobile Sizing */
                                    px-3 py-3 text-[15px] gap-3.5
                                    /* Desktop Sizing */
                                    sm:px-2.5 sm:py-1.5 sm:text-[14px] sm:gap-2.5
                                `}
                             >
                                <Trash2 className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-[#787774] group-hover:text-[#37352f] transition-colors" />
                                <span className="flex-1">Clear history</span>
                             </button>
                             
                             <button className={`
                                    flex items-center text-left text-[#37352f] 
                                    hover:bg-[#efefed] rounded-lg sm:rounded-md 
                                    transition-colors mx-1.5 opacity-50 cursor-not-allowed
                                    /* Mobile Sizing */
                                    px-3 py-3 text-[15px] gap-3.5
                                    /* Desktop Sizing */
                                    sm:px-2.5 sm:py-1.5 sm:text-[14px] sm:gap-2.5
                             `}>
                                <Download className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-[#787774]" />
                                <span className="flex-1">Export chat</span>
                             </button>

                             <div className="h-px bg-[#e9e9e7] my-1 mx-2" />
                             
                             <button className={`
                                    flex items-center text-left text-[#37352f] 
                                    hover:bg-[#efefed] rounded-lg sm:rounded-md 
                                    transition-colors mx-1.5 opacity-50 cursor-not-allowed
                                    /* Mobile Sizing */
                                    px-3 py-3 text-[15px] gap-3.5
                                    /* Desktop Sizing */
                                    sm:px-2.5 sm:py-1.5 sm:text-[14px] sm:gap-2.5
                             `}>
                                <Settings className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-[#787774]" />
                                <span className="flex-1">Settings</span>
                             </button>
                             
                             <button className={`
                                    flex items-center text-left text-[#37352f] 
                                    hover:bg-[#efefed] rounded-lg sm:rounded-md 
                                    transition-colors mx-1.5 opacity-50 cursor-not-allowed
                                    /* Mobile Sizing */
                                    px-3 py-3 text-[15px] gap-3.5
                                    /* Desktop Sizing */
                                    sm:px-2.5 sm:py-1.5 sm:text-[14px] sm:gap-2.5
                             `}>
                                <HelpCircle className="w-[18px] h-[18px] sm:w-4 sm:h-4 text-[#787774]" />
                                <span className="flex-1">Help & feedback</span>
                             </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded shadow-sm bg-white border border-[#e9e9e7] flex items-center justify-center shrink-0 mt-1">
                <HamroLogo className="w-5 h-5 text-purple-600" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'user' && (
                    <div className="text-xs text-gray-400 mb-1 mr-1">Buddy</div>
                )}
                {msg.role === 'model' && (
                    <div className="text-xs text-gray-400 mb-1 ml-1">Hamro AI</div>
                )}
                
                <div 
                    className={`
                        py-3 px-4 rounded-lg text-[15px]
                        ${msg.role === 'user' 
                            ? 'bg-[#f7f7f5] text-[#37352f]' 
                            : 'bg-transparent text-[#37352f] w-full'
                        }
                        ${msg.isError ? 'bg-red-50 text-red-600 border border-red-100' : ''}
                    `}
                >
                    {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                        <MarkdownRenderer content={msg.content} />
                    )}
                </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                <User size={18} className="text-gray-500" />
              </div>
            )}
          </div>
        ))}

        {loadingState !== LoadingState.IDLE && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded shadow-sm bg-white border border-[#e9e9e7] flex items-center justify-center shrink-0">
               <HamroLogo className="w-5 h-5 text-purple-600 animate-pulse" />
            </div>
            <div className="flex items-center h-8">
                <span className="text-sm text-gray-500 animate-pulse">AI is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:px-8 sm:pb-8 bg-white">
        <div className="relative border border-[#e9e9e7] rounded-xl shadow-sm bg-white focus-within:ring-1 focus-within:ring-[#d3d1cb] transition-shadow">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to write, edit, or answer..."
            className="w-full max-h-[200px] pt-3 pb-10 pl-4 pr-12 bg-transparent resize-none outline-none text-[#37352f] placeholder-gray-400 min-h-[80px]"
            rows={1}
            disabled={loadingState !== LoadingState.IDLE}
          />
          
          {/* Model Selector - Bottom Left */}
          <div className="absolute left-3 bottom-3 z-10">
            <div className="relative">
              <button 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#37352f] hover:bg-[#efefed] px-2 py-1.5 rounded transition-colors"
                title="Select AI Model"
              >
                <Sparkles size={12} className={selectedModel === 'gemini-3-pro-preview' ? 'text-purple-600' : 'text-gray-400'} />
                <span>{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</span>
                <ChevronDown size={12} className="opacity-70" />
              </button>
              
              {isModelDropdownOpen && (
                <>
                  <div 
                      className="fixed inset-0 z-0" 
                      onClick={() => setIsModelDropdownOpen(false)} 
                  />
                  <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-[#e9e9e7] rounded-lg shadow-lg overflow-hidden py-1 z-10">
                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Select Model</div>
                    {AVAILABLE_MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f7f7f5] transition-colors flex items-center justify-between group ${selectedModel === model.id ? 'bg-[#f7f7f5]' : ''}`}
                      >
                        <span className={selectedModel === model.id ? 'text-purple-600 font-medium' : 'text-[#37352f]'}>
                          {model.name}
                        </span>
                        {selectedModel === model.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Send Button - Bottom Right */}
          <div className="absolute right-2 bottom-2">
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || loadingState !== LoadingState.IDLE}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${inputValue.trim() 
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' 
                    : 'bg-transparent text-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <Send size={16} className={inputValue.trim() ? "translate-x-0.5" : ""} />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
           <p className="text-[11px] text-gray-400">Hamro AI can make mistakes. Please check important info.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;